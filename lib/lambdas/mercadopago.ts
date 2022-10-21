import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import createClient from './mercadopago/mercadopago-create-client';

const TABLE_NAME = process.env.TABLE_NAME || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  if (event.resource.includes('client')) {
    if (event.httpMethod === "POST") return createClient(db, event, context.awsRequestId, TABLE_NAME);
    if (event.httpMethod === "PUT") return createClient(db, event, context.awsRequestId, TABLE_NAME);
  }
  return createClient(db, event, context.awsRequestId, TABLE_NAME);
};
