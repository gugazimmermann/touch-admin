import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ProfileType } from "../common/types";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const profilePost = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, PROFILE_TABLE: string): Promise<APIGatewayProxyResult> => {
  
  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.profileID || !body.email) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))

  const dateNow = Date.now().toString();
  const profile: ProfileType = {
    profileID:  body.profileID,
    email: body.email,
    owners: [],
    createdAt: dateNow,
    updatedAt: dateNow
  };

  const params = { TableName: PROFILE_TABLE, Item: profile };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  
  try {
    await db.put(params).promise();
    return commonResponse(201, JSON.stringify({ data: profile, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
};

export default profilePost;