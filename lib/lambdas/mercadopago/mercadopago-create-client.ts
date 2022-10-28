import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { ProfileType, UUID } from '../common/types';
import { IMercadoPagoClient } from "../common/types-mercadopago";
import axiosErrorHandling from "../common/axiosErrorHandling";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const MERCADO_PAGO_ACCESS_TOKEN_TEST = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || "";

const headers = {
  Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN_TEST}`,
  "Content-Type": "application/json",
};

const createClientData = (profile: ProfileType): IMercadoPagoClient => {
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

const seeExists = async (email: string): Promise<IMercadoPagoClient> => {
  const { data } = await axios.get(`https://api.mercadopago.com/v1/customers/search?email=${email}`, { headers });
  return data.results && data.results[0] ? data.results[0] : undefined;
};

const create = async (client: IMercadoPagoClient): Promise<IMercadoPagoClient> => {
  try {
    const { data } = await axios.post(`https://api.mercadopago.com/v1/customers`, client, { headers });
    return data;
  } catch (error) {
    console.log("create error", axiosErrorHandling(error));
    return {} as IMercadoPagoClient;
  }
};

const update = async (id: UUID, client: IMercadoPagoClient): Promise<IMercadoPagoClient> => {
  try {
    const { data } = await axios.put(`https://api.mercadopago.com/v1/customers/${id}`, client, { headers });
    return data;
  } catch (error) {
    console.log("update error", axiosErrorHandling(error));
    return {} as IMercadoPagoClient;
  }
};

const createClient = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.profileID || !body.profile) return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));

  const profile = body.profile as ProfileType;
  let client = {};

  let clientExists = await seeExists(profile.email as string);
  const clientData = createClientData(profile);

  if (clientExists) {
    delete clientData.email;
    client = await update(clientExists.id as UUID, clientData);
  } else {
    client = await create(clientData);
  }
  const params = {
    TableName,
    Key: { profileID: body.profileID },
    UpdateExpression: "set #mercadopago = :mercadopago",
    ExpressionAttributeValues: { ":mercadopago": client },
    ExpressionAttributeNames: { "#mercadopago": "mercadopago" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.update(params).promise();
    console.debug(`res.Attributes`, JSON.stringify(res.Attributes, undefined, 2));
    return commonResponse(200, JSON.stringify({ data: res.Attributes, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
};

export default createClient;
