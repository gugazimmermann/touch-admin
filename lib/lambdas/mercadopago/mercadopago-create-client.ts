import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { IMercadoPagoClient, ProfileType, UUID } from '../common/types';

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const MERCADO_PAGO_ACCESS_TOKEN_TEST = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || "";

const headers = {
  Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN_TEST}`,
  "Content-Type": "application/json",
};

const getProfile = async (db: DocumentClient, TableName: string, profileID: UUID): Promise<ProfileType> => {
  const params = { TableName, Key: { profileID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as ProfileType;
}

const seeExists = async (email: string): Promise<IMercadoPagoClient> => {
  const { data } = await axios.get(`https://api.mercadopago.com/v1/customers/search?email=${email}`, { headers });
  return data.results && data.results[0] ? data.results[0] : undefined;
};

const create = async (email: string): Promise<IMercadoPagoClient> => {
  const { data } = await axios.post(`https://api.mercadopago.com/v1/customers`, { email }, { headers });
  return data;
};

const createClient = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.profileID || !body.email) return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));

  const profile = await getProfile(db, TableName, body.profileID);
  console.debug("profile", profile);

  if (!profile.profileID) return commonResponse(404, JSON.stringify({ error: 'profile not found', requestID }));

  let client = await seeExists(body.email);
  console.debug("client exists", client);
  if (!client) {
    client = await create(body.email);
    console.debug("client created", client);
  }

  const params = {
    TableName,
    Key: { profileID: profile.profileID },
    UpdateExpression: "set #mercadopago = :mercadopago",
    ExpressionAttributeValues: { ":mercadopago": client },
    ExpressionAttributeNames: { "#mercadopago": "mercadopago" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.update(params).promise();
    console.debug(`res.Attributes`, JSON.stringify(res.Attributes, undefined, 2));
    return commonResponse(201, JSON.stringify({ data: res.Attributes, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
};

export default createClient;
