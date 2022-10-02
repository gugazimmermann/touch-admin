import AWS = require("aws-sdk");
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import commonResponse from "../common/commonResponse";
import { OwnerType } from '../common/types';

const db = new AWS.DynamoDB.DocumentClient();
const dateNow = Date.now().toString();

const patchEmail = async (profileID: string, email: string, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const queryParams = {
    TableName,
    Key: { profileID },
    ProjectionExpression: "#email",
    ExpressionAttributeNames: { "#email": "email" },
  };
  try {
    const queryResponse = await db.get(queryParams).promise();
    const actualEmail = queryResponse?.Item?.email || null;
    if (!actualEmail || actualEmail === email)
      return commonResponse(409, JSON.stringify({ message: 'Same Email', requestID}));
  } catch (error) {
    return commonResponse(500, JSON.stringify(error));
  }
  const params = {
    TableName,
    Key: { profileID },
    UpdateExpression: "set #email = :email, #updatedAt = :updatedAt",
    ExpressionAttributeValues: { ":email": email, ":updatedAt": dateNow },
    ExpressionAttributeNames: {"#email": "email", "#updatedAt": "updatedAt" },
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
}

const patchOwers = async (profileID: string, body: OwnerType, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  if (!body || !body.name || !body.email || !body.phone) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))
  const ownersList: OwnerType[] = [];
  const queryParams = {
    TableName,
    Key: { profileID },
    ProjectionExpression: "#owners",
    ExpressionAttributeNames: { "#owners": "owners" },
  };
  console.debug(`queryParams`, JSON.stringify(queryParams, undefined, 2));
  try {
    const queryResponse = await db.get(queryParams).promise();
    (queryResponse.Item || []).forEach((i: OwnerType) => ownersList.push(i));
  } catch (error) {
    console.error(`error get`, JSON.stringify(error, undefined, 2));
  }
  if (!body.ownerID && body.name) {
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
    TableName,
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
}

const profilePatch = async (event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const profileID = event?.pathParameters && event.pathParameters?.profileID;
  if (!profileID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))
  const body = event?.body ? JSON.parse(event.body) : null;
  if (!body || !body.email) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))
  if (event.resource.includes('owners')) return patchOwers(profileID, body, requestID, TableName);
  else return patchEmail(profileID, body.email, requestID, TableName); 
};

export default profilePatch;