import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import commonResponse from "../common/commonResponse";
import { ProfileType, UUID } from '../common/types';
import { getProfileByID } from "../utils";
import { getClientByProfileID } from "./utils/db";
import { MPClientDataType } from "./types";
import { clientGet, clientUpdate, clientCreate } from './utils/api';

const createClientData = (profile: ProfileType): MPClientDataType => {
  const m = profile.name ? profile.name.split(" ") : [];
  const p = profile.phone?.replace(/[^\d]/g, "").slice(2);
  return {
    email: profile?.email || "",
    first_name: m[0] || "",
    last_name: m[1] || "",
    identification: {
      type: profile.documenttype || "",
      number: profile.document || "",
    },
    phone: {
      area_code: p?.slice(0, 2),
      number: p?.slice(2),
    },
    address: {
      id: profile.profileID,
      zip_code: profile.zipCode || "",
      street_name: profile.street || "",
      street_number: +(profile?.number || 0),
    },
  }
}

const createClient = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, PROFILE_TABLE: string, MERCADOPAGOCLIENTS_TABLE: string): Promise<APIGatewayProxyResult> => {
  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.profileID) return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));

  let client = {} as MPClientDataType;

  const profile = await getProfileByID(db, body.profileID, PROFILE_TABLE);

  let clientExists = await clientGet(profile.email as string);
  const clientData = createClientData(profile);
  if (clientExists?.id) {
    delete clientData.email;
    client = await clientUpdate(clientExists.id as UUID, clientData);
  } else {
    client = await clientCreate(clientData);
  }

  const mercadoPagoClient = await getClientByProfileID(db, profile.profileID, MERCADOPAGOCLIENTS_TABLE);
  if (mercadoPagoClient) {
    let params = {
      TableName: MERCADOPAGOCLIENTS_TABLE,
      Key: {
        clientID: client.id,
      },
      UpdateExpression: "set #client = :client",
      ExpressionAttributeValues: { ":client": client },
      ExpressionAttributeNames: { "#client": "client" },
      ReturnValues: "ALL_NEW",
    };
    console.debug(`update params`, JSON.stringify(params, undefined, 2));
    try {
      await db.update(params).promise();
    } catch (error) {
      console.error(`error`, JSON.stringify(error, undefined, 2));
      return commonResponse(500, JSON.stringify({ error, requestID }));
    }
  } else {
    let params = {
      TableName: MERCADOPAGOCLIENTS_TABLE,
      Item: {
        clientID: client.id,
        profileID: profile.profileID,
        client
      }
    };
    console.debug(`put params`, JSON.stringify(params, undefined, 2));
    try {
      await db.put(params).promise();
    } catch (error) {
      console.error(`error`, JSON.stringify(error, undefined, 2));
      return commonResponse(500, JSON.stringify({ error, requestID}));
    }
  }

  return commonResponse(200, JSON.stringify({ data: {}, requestID }));
};

export default createClient;
