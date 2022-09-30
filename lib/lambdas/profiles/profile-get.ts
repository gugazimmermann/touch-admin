import AWS = require("aws-sdk");
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import commonResponse from "../common/commonResponse";

const db = new AWS.DynamoDB.DocumentClient();

const getOne = async (profileID: string, requestID: string, TableName: string): Promise<APIGatewayProxyResultV2> => {
  const params = { TableName, Key: { profileID } };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.get(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Item, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const getAll = async (requestID: string, TableName: string): Promise<APIGatewayProxyResultV2> => {
  const params = { TableName };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.scan(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Items, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const profileGet = async (event: APIGatewayProxyEventV2, requestID: string, TableName: string): Promise<APIGatewayProxyResultV2> => {
  const profileID = event?.pathParameters && event.pathParameters?.profileID;
  if (profileID) return getOne(profileID, requestID, TableName);
  return getAll(requestID, TableName);
};

export default profileGet;