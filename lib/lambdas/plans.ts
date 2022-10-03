import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import commonResponse from "./common/commonResponse";

const TABLE_NAME = process.env.TABLE_NAME || "";
const AWS = AWSXRay.captureAWS(AWSSDK);
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent, context: Context ): Promise<APIGatewayProxyResult> => {
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
