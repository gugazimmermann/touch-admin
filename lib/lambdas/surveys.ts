import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import surveysPost from "./surveys/surveys-post";
import surveysGet from './surveys/surveys-get';

const SURVEYS_TABLE = process.env.SURVEYS_TABLE || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  if (event.httpMethod === "POST") return surveysPost(db, event, context.awsRequestId, SURVEYS_TABLE);

  return surveysGet(db, event, context.awsRequestId, SURVEYS_TABLE);

};
