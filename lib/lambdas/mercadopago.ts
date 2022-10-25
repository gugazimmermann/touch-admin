import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import createClient from './mercadopago/mercadopago-create-client';
import commonResponse from './common/commonResponse';
import createPayment from './mercadopago/mercadopago-create-payment';

const PROFILE_TABLE_NAME = process.env.PROFILE_TABLE_NAME || "";
const EVENTS_TABLE_NAME = process.env.EVENTS_TABLE_NAME || "";
const PAYMENTS_TABLE_NAME = process.env.PAYMENTS_TABLE_NAME || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  if (event.resource.includes('client')) {
    if (event.httpMethod === "POST") return createClient(db, event, context.awsRequestId, PROFILE_TABLE_NAME);
  }
  if (event.resource.includes('payment')) {
    if (event.httpMethod === "POST") return createPayment(db, event, context.awsRequestId, PROFILE_TABLE_NAME, EVENTS_TABLE_NAME, PAYMENTS_TABLE_NAME);
  }
  return commonResponse(500, JSON.stringify({ error: {}, requestID: context.awsRequestId}));
};
