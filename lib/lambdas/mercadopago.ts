import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from './common/commonResponse';
import createClient from './mercadopago/mercadopago-create-client';
import createPayment from './mercadopago/mercadopago-create-payment';
import createSubscription from './mercadopago/mercadopago-create-subscription';

const PROFILE_TABLE = process.env.PROFILE_TABLE || "";
const EVENTS_TABLE = process.env.EVENTS_TABLE || "";
const MERCADOPAGOCLIENTS_TABLE = process.env.MERCADOPAGOCLIENTS_TABLE || "";
const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || "";
const SUBSCRIPTIONS_TABLE = process.env.SUBSCRIPTIONS_TABLE || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  if (event.resource.includes('client')) {
    if (event.httpMethod === "POST") return createClient(db, event, context.awsRequestId, PROFILE_TABLE, MERCADOPAGOCLIENTS_TABLE);
  }
  if (event.resource.includes('payment')) {
    if (event.httpMethod === "POST") return createPayment(db, event, context.awsRequestId, MERCADOPAGOCLIENTS_TABLE, EVENTS_TABLE, PAYMENTS_TABLE);
  }
  if (event.resource.includes('subscription')) {
    if (event.httpMethod === "POST") return createSubscription(db, event, context.awsRequestId, MERCADOPAGOCLIENTS_TABLE, EVENTS_TABLE, SUBSCRIPTIONS_TABLE);
  }
  return commonResponse(500, JSON.stringify({ error: {}, requestID: context.awsRequestId}));
};
