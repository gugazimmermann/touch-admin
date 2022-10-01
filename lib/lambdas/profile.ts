import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import profileDelete from "./profiles/profile-delete";
import profilePatch from "./profiles/profile-patch";
import profilePost from "./profiles/profile-post";
import profilePut from "./profiles/profile-put";
import profileGet from './profiles/profile-get';

const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  if (event.httpMethod === "POST") return profilePost(event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "PUT") return profilePut(event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "PATCH") return profilePatch(event, context.awsRequestId, TABLE_NAME);

  if (event.httpMethod === "DELETE") return profileDelete(event, context.awsRequestId, TABLE_NAME);

  return profileGet(event, context.awsRequestId, TABLE_NAME);

};
