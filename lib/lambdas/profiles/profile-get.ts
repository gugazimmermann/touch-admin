import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const getOne = async (db: DocumentClient, profileID: string, requestID: string, PROFILE_TABLE: string): Promise<APIGatewayProxyResult> => {
  const params = { TableName: PROFILE_TABLE, Key: { profileID } };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.get(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Item || {}, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const getAll = async (db: DocumentClient, requestID: string, PROFILE_TABLE: string): Promise<APIGatewayProxyResult> => {
  const params = { TableName: PROFILE_TABLE };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.scan(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Items, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const profileGet = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, PROFILE_TABLE: string): Promise<APIGatewayProxyResult> => {
  const profileID = event?.pathParameters && event.pathParameters?.profileID;
  if (profileID) return getOne(db, profileID, requestID, PROFILE_TABLE);
  return getAll(db, requestID, PROFILE_TABLE);
};

export default profileGet;