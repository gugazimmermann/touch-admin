import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import commonResponse from "../common/commonResponse";
import { OwnerType } from '../common/types';
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const dateNow = Date.now().toString();

const patchLogoAndMap = async (db: DocumentClient, profileID: string, body: { logo?: string; map?: string; }, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  console.debug(`body`, JSON.stringify(body, undefined, 2));
  const params = {
    TableName,
    Key: { profileID },
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

const patchOwers = async (db: DocumentClient, profileID: string, body: OwnerType, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  if (!body || !body.name || !body.email || !body.phone) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID }))
  let ownersList: OwnerType[] = [];
  const queryParams = {
    TableName,
    Key: { profileID },
    ProjectionExpression: "#owners",
    ExpressionAttributeNames: { "#owners": "owners" },
  };
  try {
    const queryResponse = await db.get(queryParams).promise();
    console.debug(`queryResponse`, JSON.stringify(queryResponse.Item?.owners, undefined, 2));
    (queryResponse.Item?.owners || []).forEach((i: OwnerType) => ownersList.push(i));
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
  } else if (body.ownerID && !body.name) {
    ownersList = ownersList.filter(o => o.ownerID !== body.ownerID);
  } else {
    ownersList = ownersList.map(o => {
      if (o.ownerID === body.ownerID) {
        o.name = body.name,
          o.email = body.email,
          o.phone = body.phone,
          o.updatedAt = dateNow
      }
      return o
    })
  }
  console.debug(`ownersList`, JSON.stringify(ownersList, undefined, 2));
  const params = {
    TableName,
    Key: { profileID },
    UpdateExpression: "set #owners = :owners, #updatedAt = :updatedAt",
    ExpressionAttributeValues: { ":owners": ownersList, ":updatedAt": dateNow },
    ExpressionAttributeNames: { "#owners": "owners", "#updatedAt": "updatedAt" },
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

const patchEmail = async (db: DocumentClient, profileID: string, email: string, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
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
      return commonResponse(409, JSON.stringify({ message: 'Same Email', requestID }));
  } catch (error) {
    return commonResponse(500, JSON.stringify(error));
  }
  const params = {
    TableName,
    Key: { profileID },
    UpdateExpression: "set #email = :email, #updatedAt = :updatedAt",
    ExpressionAttributeValues: { ":email": email, ":updatedAt": dateNow },
    ExpressionAttributeNames: { "#email": "email", "#updatedAt": "updatedAt" },
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

const profilePatch = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  const profileID = event?.pathParameters && event.pathParameters?.profileID;
  if (!profileID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID }))

  const body = event?.body ? JSON.parse(event.body) : null;

  if (event.resource.includes('logomap')) return patchLogoAndMap(db, profileID, body, requestID, TableName);
  else if (event.resource.includes('owners')) return patchOwers(db, profileID, body, requestID, TableName);
  else {
    if (!body || !body.email) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID }))
    return patchEmail(db, profileID, body.email, requestID, TableName);
  }
};

export default profilePatch;