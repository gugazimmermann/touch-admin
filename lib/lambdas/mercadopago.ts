import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from './common/commonResponse';
import createPayment from './mercadopago/mercadopago-create-payment';
import createSubscription from './mercadopago/mercadopago-create-subscription';

const PROFILE_TABLE = process.env.PROFILE_TABLE || "";
const EVENTS_TABLE = process.env.EVENTS_TABLE || "";
const EVENTS_PAYMENTS_TABLE = process.env.EVENTS_PAYMENTS_TABLE || "";
const SUBSCRIPTIONS_PAYMENTS_TABLE = process.env.SUBSCRIPTIONS_PAYMENTS_TABLE || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  if (event.resource.includes('payment')) {
    if (event.httpMethod === "POST") return createPayment(db, event, context.awsRequestId, PROFILE_TABLE, EVENTS_TABLE, EVENTS_PAYMENTS_TABLE);
  }
  if (event.resource.includes('subscription')) {
    if (event.httpMethod === "POST") return createSubscription(db, event, context.awsRequestId, PROFILE_TABLE, EVENTS_TABLE, SUBSCRIPTIONS_PAYMENTS_TABLE);
  }
  return commonResponse(500, JSON.stringify({ error: {}, requestID: context.awsRequestId}));
};
