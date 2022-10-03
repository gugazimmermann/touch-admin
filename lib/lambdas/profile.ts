import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import profilePost from "./profiles/profile-post";
import profilePut from "./profiles/profile-put";
import profilePatch from "./profiles/profile-patch";
import profileDelete from "./profiles/profile-delete";
import profileGet from './profiles/profile-get';

const TABLE_NAME = process.env.TABLE_NAME || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  if (event.httpMethod === "POST") return profilePost(db, event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "PUT") return profilePut(db, event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "PATCH") return profilePatch(db, event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "DELETE") return profileDelete(db, event, context.awsRequestId, TABLE_NAME);

  return profileGet(db, event, context.awsRequestId, TABLE_NAME);

};
