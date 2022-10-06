import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import commonResponse from "./common/commonResponse";

const TABLE_NAME = process.env.TABLE_NAME || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

const getAll = async (requestID: string): Promise<APIGatewayProxyResult> => {
  const params = { TableName: TABLE_NAME };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.scan(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Items, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
}

const getByCode = async (code: string, requestID: string): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "byCode",
    KeyConditionExpression: "#code = :code",
    ExpressionAttributeNames: { "#code": "code" },
    ExpressionAttributeValues: { ":code": code },
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.query(params).promise();
    return commonResponse(200, JSON.stringify({ data: (res.Items && res.Items.length ? res.Items[0] : {}), requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
}

const getByID = async (referralID: string, requestID: string): Promise<APIGatewayProxyResult> => {
  const params = { TableName: TABLE_NAME, Key: { referralID } };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.get(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Item || {}, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  const requestID = context.awsRequestId;
  const referralID = event?.pathParameters && event.pathParameters?.referralID;
  const code = event?.pathParameters && event.pathParameters?.code;

  if (code) return await getByCode(code, requestID);
  if (referralID) return await getByID(referralID as string, requestID);
  return await getAll(requestID)
};
