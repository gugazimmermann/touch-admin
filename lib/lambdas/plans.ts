import AWS = require("aws-sdk");
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import commonResponse from "./common/commonResponse";

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEventV2, context: Context ): Promise<APIGatewayProxyResultV2> => {
  console.debug(`event`, JSON.stringify(event, undefined, 2));
  const requestID = context.awsRequestId;
  const params = { TableName: TABLE_NAME };
  console.debug(`params`, JSON.stringify(params, undefined, 2));
  try {
    const res = await db.scan(params).promise();
    return commonResponse(200, JSON.stringify({ data: res.Items, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID}));
  }
};
