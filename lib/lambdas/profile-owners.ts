import AWS = require("aws-sdk");
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import commonResponse from "./common/commonResponse";
import { OwnerType } from './common/types';

const TABLE_NAME = process.env.TABLE_NAME || "";

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));

  const paramsScan = { TableName: TABLE_NAME };
  console.debug(`paramsScan`, JSON.stringify(paramsScan, undefined, 2));
  try {
    const scan = await db.scan(paramsScan).promise();
    console.debug("scan", scan)
  } catch (error) {
    console.error(`error scan`, JSON.stringify(error, undefined, 2));
  }

  const profileID = event?.pathParameters && event.pathParameters?.profileID;
  const requestID = context.awsRequestId;

  if (!profileID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))

  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.name || !body.email || !body.phone) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))

  const ownersList: OwnerType[] = [];

  const queryParams = {
    TableName: TABLE_NAME,
    Key: { profileID },
  };
  console.debug(`queryParams`, JSON.stringify(queryParams, undefined, 2));
  try {
    const queryResponse = await db.get(queryParams).promise();
    (queryResponse.Item || []).forEach((i: OwnerType) => ownersList.push(i));
  } catch (error) {
    console.error(`error get`, JSON.stringify(error, undefined, 2));
  }

  const dateNow = Date.now().toString();

  if (!body.ownerID) {
    ownersList.push({
      ownerID: uuidv4(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      createdAt: dateNow,
      updatedAt: dateNow
    })
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { profileID },
    UpdateExpression: "set #owners = :owners, #updatedAt = :updatedAt",
    ExpressionAttributeValues: { ":owners": ownersList, ":updatedAt": dateNow },
    ExpressionAttributeNames: {"#owners": "owners", "#updatedAt": "updatedAt" },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  
  try {
    const res = await db.update(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Attributes, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }

};
