import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PaymentData, PaymentDataType, PaymentRes } from "../common/types-mercadopago";
import getClientByProfileID from './get-client-by-profileID';
import getEventByID from '../utils/get-event-by-id';

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const MERCADO_PAGO_ACCESS_TOKEN_TEST = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || "";

const headers = {
  Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN_TEST}`,
  "Content-Type": "application/json",
};

const mercadoPagoPayment = async (mercadoPagoPayment: PaymentData): Promise<PaymentRes> => {
  const { data } = await axios.post(`https://api.mercadopago.com/v1/payments`, mercadoPagoPayment, { headers });
  return data;
};

const createPayment = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  MERCADOPAGOCLIENTS_TABLE: string,
  EVENTS_TABLE: string,
  PAYMENTS_TABLE: string,
): Promise<APIGatewayProxyResult> => {
  const body = (event?.body ? JSON.parse(event.body) : {}) as PaymentDataType;

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
    return commonResponse(400,JSON.stringify({ message: "Missing Data", requestID }));

  const clientData = await getClientByProfileID(db, body.profileID, MERCADOPAGOCLIENTS_TABLE);
  const eventData = await getEventByID(db, EVENTS_TABLE, body.eventID);
  const paymentData: PaymentData = {
    additional_info: {
      items: [
        {
          id: eventData.plan.planID,
          title: eventData.plan.name,
          description: `Touch Sistemas - Plano ${eventData.plan.name}`,
          category_id: "Events",
          quantity: 1,
          unit_price: +eventData.plan.price,
        },
      ],
      payer: {
        first_name: clientData?.first_name as string,
        last_name: clientData?.last_name as string,
        phone: {
          area_code: clientData?.phone?.area_code as string,
          number: clientData?.phone?.number as string,
        },
        address: {
          zip_code: clientData?.address?.zip_code as string,
          street_name: clientData?.address?.street_name as string,
        },
      },
    },
    description: `Touch Sistemas - Plano ${eventData.plan.name}`,
    installments: Number(body.installments),
    issuer_id: body.issuer_id,
    payer: {
      id: clientData?.id as string,
      email: clientData?.email as string,
      identification: body.identification,
      first_name: clientData?.first_name as string,
      last_name: clientData?.last_name as string,
    },
    payment_method_id: body.payment_method_id,
    statement_descriptor: `Touch Sistemas - Plano ${eventData.plan.name}`,
    token: body.token,
    transaction_amount: Number(eventData.plan.price.toFixed(2)),
  };
  console.debug("paymentData", JSON.stringify(paymentData, undefined, 2));
  const paymentRes = await mercadoPagoPayment(paymentData);

  const params = {
    TableName: EVENTS_TABLE,
    Key: { eventID: body.eventID },
    UpdateExpression: "set #payment = :payment",
    ExpressionAttributeValues: { ":payment": paymentRes },
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

  const paymentParams = { TableName: PAYMENTS_TABLE, Item: {
    paymentID: `${paymentRes?.id}`,
    profileID: body.profileID,
    eventID: eventData?.eventID,
    ...paymentRes
  } };
  console.debug(`paymentParams`, JSON.stringify(paymentParams, undefined, 2));
  try {
    await db.put(paymentParams).promise();
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }

  return commonResponse(201, JSON.stringify({ data: res.Attributes, requestID }));
};

export default createPayment;
