import AWS = require("aws-sdk");
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import commonResponse from "../common/commonResponse";

const db = new AWS.DynamoDB.DocumentClient();

const profileDelete = async (event: APIGatewayProxyEventV2, requestID: string, TableName: string): Promise<APIGatewayProxyResultV2> => {
  
  const profileID = event?.pathParameters && event.pathParameters?.profileID;

  if (!profileID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID}))

  const params = {
    TableName,
    Key: { profileID },
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  
  try {
    const res = await db.delete(params).promise();
    return commonResponse(200, JSON.stringify({ requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
};

export default profileDelete;