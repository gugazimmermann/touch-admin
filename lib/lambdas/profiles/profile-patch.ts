import AWS = require("aws-sdk");
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";

const db = new AWS.DynamoDB.DocumentClient();

const profilePatch = async (event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  
  const profileID = event?.pathParameters && event.pathParameters?.profileID;

  if (!profileID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))

  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.email) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))

  const queryParams = {
    TableName,
    Key: { profileID },
    ProjectionExpression: "#email",
    ExpressionAttributeNames: { "#email": "email" },
  };
  try {
    const queryResponse = await db.get(queryParams).promise();
    const actualEmail = queryResponse?.Item?.email || null;
    if (!actualEmail || actualEmail === body.email)
      return commonResponse(409, JSON.stringify({ message: 'Same Email', requestID}));
  } catch (error) {
    return commonResponse(500, JSON.stringify(error));
  }

  const dateNow = Date.now().toString();

  const params = {
    TableName,
    Key: { profileID },
    UpdateExpression: "set #email = :email, #updatedAt = :updatedAt",
    ExpressionAttributeValues: { ":email": body.email, ":updatedAt": dateNow },
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
};

export default profilePatch;