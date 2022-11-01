import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { getClientByProfileID } from "./utils/db";
import { getEventByID } from "../utils";
import { EventType } from '../common/types';
import { MPPaymentPayloadType, MPClientDataType, MPPaymentType } from "./types";
import { paymentCreate } from "./utils/api";

const createPaymentData = (event: EventType, client: MPClientDataType, payment: MPPaymentType): MPPaymentPayloadType => {
  return {
    additional_info: {
      items: [
        {
          id: event.plan.planID,
          title: event.plan.name,
          description: `Touch Sistemas - Plano ${event.plan.name}`,
          category_id: "Events",
          quantity: 1,
          unit_price: +event.plan.price,
        },
      ],
      payer: {
        first_name: client?.first_name as string,
        last_name: client?.last_name as string,
        phone: {
          area_code: client?.phone?.area_code as string,
          number: client?.phone?.number as string,
        },
        address: {
          zip_code: client?.address?.zip_code as string,
          street_name: client?.address?.street_name as string,
        },
      },
    },
    description: `Touch Sistemas - Plano ${event.plan.name}`,
    installments: Number(payment.installments),
    issuer_id: payment.issuer_id,
    payer: {
      id: client?.id as string,
      email: client?.email as string,
      identification: payment.identification,
      first_name: client?.first_name as string,
      last_name: client?.last_name as string,
    },
    payment_method_id: payment.payment_method_id,
    statement_descriptor: `Touch Sistemas - Plano ${event.plan.name}`,
    token: payment.token,
    transaction_amount: Number(event.plan.price.toFixed(2)),
  }
}

const createPayment = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  MERCADOPAGOCLIENTS_TABLE: string,
  EVENTS_TABLE: string,
  EVENTS_PAYMENTS_TABLE: string
): Promise<APIGatewayProxyResult> => {
  const body = (event?.body ? JSON.parse(event.body) : {}) as MPPaymentType;

  if (
    !body ||
    !body.profileID ||
    !body.eventID ||
    !body.installments ||
    !body.issuer_id ||
    !body.identification?.type ||
    !body.identification?.number ||
    !body.payment_method_id ||
    !body.token
  )
    return commonResponse(
      400,
      JSON.stringify({ message: "Missing Data", requestID })
    );

  const eventData = await getEventByID(db, body.eventID, EVENTS_TABLE);
  const clientData = await getClientByProfileID(
    db,
    body.profileID,
    MERCADOPAGOCLIENTS_TABLE
  );
  const paymentPayload = createPaymentData(eventData, clientData, body);
  console.debug("paymentPayload", JSON.stringify(paymentPayload, undefined, 2));
  const paymentResponse = await paymentCreate(paymentPayload);

  const params = {
    TableName: EVENTS_TABLE,
    Key: { eventID: body.eventID },
    UpdateExpression: "set #payment = :payment",
    ExpressionAttributeValues: { ":payment": paymentResponse },
    ExpressionAttributeNames: { "#payment": "payment" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));

  let res = undefined;

  try {
    res = await db.update(params).promise();
    console.debug(
      `res.Attributes`,
      JSON.stringify(res.Attributes, undefined, 2)
    );
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }

  const paymentParams = {
    TableName: EVENTS_PAYMENTS_TABLE,
    Item: {
      paymentID: `${paymentResponse?.id}`,
      profileID: body.profileID,
      eventID: eventData?.eventID,
      ...paymentResponse,
    },
  };
  console.debug(`paymentParams`, JSON.stringify(paymentParams, undefined, 2));
  try {
    await db.put(paymentParams).promise();
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }

  return commonResponse(
    201,
    JSON.stringify({ data: res.Attributes, requestID })
  );
};

export default createPayment;
