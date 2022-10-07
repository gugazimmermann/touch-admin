import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const getByEventID = async (db: DocumentClient, eventID: string, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const params = { TableName, Key: { eventID } };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.get(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Item || {}, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const getByProfileID = async (db: DocumentClient, profileID: string, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: TableName,
    IndexName: "byProfileID",
    KeyConditionExpression: "#profileID = :profileID",
    ExpressionAttributeNames: { "#profileID": "profileID" },
    ExpressionAttributeValues: { ":profileID": profileID },
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.query(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Items || [], requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const profileGet = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const eventID = event?.pathParameters && event.pathParameters?.eventID;
  if (eventID) return getByEventID(db, eventID, requestID, TableName);
  const profileID = event?.pathParameters && event.pathParameters?.profileID;
  return getByProfileID(db, profileID as string, requestID, TableName);
};

export default profileGet;