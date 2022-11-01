import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { getEventByID } from "../utils";
import { MPPaymentType, MPSubscriptionPayloadType } from "./types";
import { getClientByProfileID } from "./utils/db";
import { subscriptionCreate } from "./utils/api";

const createSubscription = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  MERCADOPAGOCLIENTS_TABLE: string,
  EVENTS_TABLE: string,
  SUBSCRIPTIONS_TABLE: string
): Promise<APIGatewayProxyResult> => {
  const body = (event?.body ? JSON.parse(event.body) : {}) as MPPaymentType;

  if (!body || !body.profileID || !body.eventID || !body.token) return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));
  
  const clientData = await getClientByProfileID(db, body.profileID, MERCADOPAGOCLIENTS_TABLE);
  const eventData = await getEventByID(db, EVENTS_TABLE, body.eventID);

  const subscriptionPayload: MPSubscriptionPayloadType = {
    reason: "Touch Sistemas - Assinatura",
    external_reference: body.eventID,
    payer_email: clientData?.email as string,
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
  console.debug("MPSubscriptionPayloadType", JSON.stringify(subscriptionPayload, undefined, 2));
  const MPSubscriptionResponseType = await subscriptionCreate(subscriptionPayload);

  const params = {
    TableName: EVENTS_TABLE,
    Key: { eventID: body.eventID },
    UpdateExpression: "set #payment = :payment",
    ExpressionAttributeValues: { ":payment": MPSubscriptionResponseType },
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
      paymentID: `${MPSubscriptionResponseType?.id}`,
      profileID: body.profileID,
      eventID: eventData?.eventID,
      ...MPSubscriptionResponseType,
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
