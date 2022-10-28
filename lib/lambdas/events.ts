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

const REFERRAL_TABLE = process.env.REFERRAL_TABLE || "";
const EVENTS_TABLE = process.env.EVENTS_TABLE || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  if (event.httpMethod === "POST") return eventsPost(db, event, context.awsRequestId, EVENTS_TABLE, REFERRAL_TABLE);

  if (event.httpMethod === "PATCH") return eventsPatch(db, event, context.awsRequestId, EVENTS_TABLE);

  return eventsGet(db, event, context.awsRequestId, EVENTS_TABLE);

};
