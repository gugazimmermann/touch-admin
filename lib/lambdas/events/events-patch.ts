import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const patchLogoAndMap = async (db: DocumentClient, eventID: string, body: { logo?: string; map?: string; }, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  console.debug(`body`, JSON.stringify(body, undefined, 2));
  const params = {
    TableName,
    Key: { eventID },
    UpdateExpression: "set #logo = :logo, #map = :map",
    ExpressionAttributeValues: { ":logo": body.logo, ":map": body.map },
    ExpressionAttributeNames: { "#logo": "logo", "#map": "map" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.update(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Attributes, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
}

const patchMethod = async (db: DocumentClient, eventID: string, body: { method: string; }, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  console.debug(`body`, JSON.stringify(body, undefined, 2));
  const params = {
    TableName,
    Key: { eventID },
    UpdateExpression: "set #method = :method",
    ExpressionAttributeValues: { ":method": body.method },
    ExpressionAttributeNames: { "#method": "method" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.update(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Attributes, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
}

const eventsPatch = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const eventID = event?.pathParameters && event.pathParameters?.eventID;
  if (!eventID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID }))
  const body = event?.body ? JSON.parse(event.body) : null;
  if (event.resource.includes('logomap')) return patchLogoAndMap(db, eventID, body, requestID, TableName);
  if (event.resource.includes('method')) return patchMethod(db, eventID, body, requestID, TableName);
  return commonResponse(400, JSON.stringify({ message: 'Bad Request', requestID }))
};

export default eventsPatch;