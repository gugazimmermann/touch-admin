import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import eventsPost from "./events/events-post";
import eventsGet from "./events/events-get";
import eventsPatch from './events/events-patch';

const TABLE_NAME = process.env.TABLE_NAME || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  if (event.httpMethod === "POST") return eventsPost(db, event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "PATCH") return eventsPatch(db, event, context.awsRequestId, TABLE_NAME);

  return eventsGet(db, event, context.awsRequestId, TABLE_NAME);

};
