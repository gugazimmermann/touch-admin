import {
  APIGatewayProxyEventV2,
  Context,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import profileDelete from "./profiles/profile-delete";
import profilePatch from "./profiles/profile-patch";
import profilePost from "./profiles/profile-post";
import profilePut from "./profiles/profile-put";
import profileGet from './profiles/profile-get';

const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler = async (event: APIGatewayProxyEventV2, context: Context ): Promise<APIGatewayProxyResultV2> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  if (event.requestContext.http.method === "POST") return profilePost(event, context.awsRequestId, TABLE_NAME);

  if (event.requestContext.http.method === "PUT") return profilePut(event, context.awsRequestId, TABLE_NAME);

  if (event.requestContext.http.method === "PATCH") return profilePatch(event, context.awsRequestId, TABLE_NAME);

  if (event.requestContext.http.method === "DELETE") return profileDelete(event, context.awsRequestId, TABLE_NAME);

  return profileGet(event, context.awsRequestId, TABLE_NAME);

};
