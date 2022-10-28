import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import createClient from './mercadopago/mercadopago-create-client';
import commonResponse from './common/commonResponse';
import createPayment from './mercadopago/mercadopago-create-payment';

const PROFILE_TABLE = process.env.PROFILE_TABLE || "";
const EVENTS_TABLE = process.env.EVENTS_TABLE || "";
const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  if (event.resource.includes('client')) {
    if (event.httpMethod === "POST") return createClient(db, event, context.awsRequestId, PROFILE_TABLE);
  }
  if (event.resource.includes('payment')) {
    if (event.httpMethod === "POST") return createPayment(db, event, context.awsRequestId, PROFILE_TABLE, EVENTS_TABLE, PAYMENTS_TABLE);
  }
  return commonResponse(500, JSON.stringify({ error: {}, requestID: context.awsRequestId}));
};
