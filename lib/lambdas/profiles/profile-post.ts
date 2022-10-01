import AWS = require("aws-sdk");
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import { ProfileType } from "../common/types";
import commonResponse from "../common/commonResponse";

const db = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

const profilePost = async (event: APIGatewayEvent, requestID: string, TableName: string): Promise<APIGatewayProxyResult> => {
  
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

  const params = { TableName, Item: profile };
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