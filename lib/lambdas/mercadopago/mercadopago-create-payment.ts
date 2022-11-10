import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { getEventByID } from "../utils";
import { EventType, ProfileType } from '../common/types';
import { MPPaymentPayloadType, MPPaymentType } from "./types";
import { paymentCreate } from "./utils/api";
import { getProfileByID } from '../utils/index';

const createPaymentData = (event: EventType, profile: ProfileType, payment: MPPaymentType): MPPaymentPayloadType => {
  const name = payment.cardholderName.split(" ");
  const phone = profile.phone?.replace(/[^\d]/g, "").slice(2);
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
        first_name: name[0],
        last_name: name[1] || name[0],
        phone: {
          area_code: phone?.slice(0, 2) as string,
          number: phone?.slice(2) as string,
        },
        address: {
          zip_code: profile.zipCode as string,
          street_name: profile.street as string,
        },
      },
    },
    description: `Touch Sistemas - Plano ${event.plan.name}`,
    installments: Number(payment.installments),
    issuer_id: payment.issuer_id,
    payer: {
      email: profile.email as string,
      identification: payment.identification,
      first_name: name[0],
      last_name: name[1] || name[0],
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
  PROFILE_TABLE: string,
  EVENTS_TABLE: string,
  EVENTS_PAYMENTS_TABLE: string
): Promise<APIGatewayProxyResult> => {
  const body = (event?.body ? JSON.parse(event.body) : {}) as MPPaymentType;

  if (
    !body ||
    !body.profileID ||
    !body.eventID ||
    !body.cardholderName ||
    !body.installments ||
    !body.issuer_id ||
    !body.identification?.type ||
    !body.identification?.number ||
    !body.payment_method_id ||
    !body.token
  )
    return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));

  const eventData = await getEventByID(db, body.eventID, EVENTS_TABLE);
  const profileData = await getProfileByID(db, body.profileID, PROFILE_TABLE);

  const paymentPayload = createPaymentData(eventData, profileData, body);
  console.debug("paymentPayload", JSON.stringify(paymentPayload, undefined, 2));
  
  const paymentResponse = await paymentCreate(paymentPayload);
  console.debug("paymentResponse", JSON.stringify(paymentResponse, undefined, 2));
  if (!paymentResponse.id) {
    return commonResponse(500, JSON.stringify({ data: {error: 'create payment error'}, requestID }));
  }
  
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
    console.debug(`res.Attributes`, JSON.stringify(res.Attributes, undefined, 2));
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
