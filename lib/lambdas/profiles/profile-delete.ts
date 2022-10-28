import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const profileDelete = async (db: DocumentClient, event: APIGatewayEvent, requestID: string, PROFILE_TABLE: string): Promise<APIGatewayProxyResult> => {

  const profileID = event?.pathParameters && event.pathParameters?.profileID;

  if (!profileID) return commonResponse(400, JSON.stringify({ message: 'Missing Data', requestID }))

  const params = {
    TableName: PROFILE_TABLE,
    Key: { profileID },
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));

  try {
    const res = await db.delete(params).promise();
    return commonResponse(200, JSON.stringify({ requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
};

export default profileDelete;