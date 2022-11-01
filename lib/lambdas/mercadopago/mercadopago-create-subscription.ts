import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { ProfileType, UUID, EventType } from "../common/types";
import { PaymentDataType, SubscriptionData, SubscriptionRes } from "../common/types-mercadopago";

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
};

const getEvent = async (db: DocumentClient, TableName: string, eventID: UUID): Promise<EventType> => {
  const params = { TableName, Key: { eventID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as EventType;
};

const mercadoPagoSubscription = async (subscriptionData: SubscriptionData): Promise<SubscriptionRes> => {
  const { data } = await axios.post(`https://api.mercadopago.com/preapproval`, subscriptionData, { headers });
  return data;
};

const createSubscription = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  PROFILE_TABLE: string,
  EVENTS_TABLE: string,
  SUBSCRIPTIONS_TABLE: string
): Promise<APIGatewayProxyResult> => {
  const body = (event?.body ? JSON.parse(event.body) : {}) as PaymentDataType;

  if (!body || !body.profileID || !body.eventID || !body.token) return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));

  const profile = await getProfile(db, PROFILE_TABLE, body.profileID);
  const eventData = await getEvent(db, EVENTS_TABLE, body.eventID);

  const subscriptionData: SubscriptionData = {
    reason: "Touch Sistemas - Assinatura",
    external_reference: body.eventID,
    payer_email: profile.mercadopago?.email as string,
    card_token_id: body.token,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      currency_id: "BRL",
      transaction_amount: 250,
    },
    back_url: `https://admin,touchsistemas.com.br/assinaturas/${eventData.eventID}`,
    status: "authorized"
  };
  console.debug("subscriptionData", JSON.stringify(subscriptionData, undefined, 2));
  const subscriptionRes = await mercadoPagoSubscription(subscriptionData);

  const params = {
    TableName: EVENTS_TABLE,
    Key: { eventID: body.eventID },
    UpdateExpression: "set #payment = :payment",
    ExpressionAttributeValues: { ":payment": subscriptionRes },
    ExpressionAttributeNames: { "#payment": "payment" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));

  let res = undefined;

  try {
    res = await db.update(params).promise();
    console.debug(`res.Attributes`, JSON.stringify(res.Attributes, undefined, 2));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }

  const subscriptionParams = {
    TableName: SUBSCRIPTIONS_TABLE,
    Item: {
      paymentID: `${subscriptionRes?.id}`,
      profileID: profile?.profileID,
      eventID: eventData?.eventID,
      ...subscriptionRes,
    },
  };
  console.debug(`subscriptionParams`, JSON.stringify(subscriptionParams, undefined, 2));
  try {
    await db.put(subscriptionParams).promise();
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }

  return commonResponse(201, JSON.stringify({ data: res.Attributes, requestID }));
};

export default createSubscription;
