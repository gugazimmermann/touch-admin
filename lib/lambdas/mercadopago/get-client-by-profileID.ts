import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { IMercadoPagoClient } from "../common/types-mercadopago";

const getClientByProfileID = async (db: DocumentClient, profileID: string, TableName: string): Promise<IMercadoPagoClient | undefined> => {
  const params = {
    TableName,
    IndexName: "byProfileID",
    KeyConditionExpression: "#profileID = :profileID",
    ExpressionAttributeNames: { "#profileID": "profileID" },
    ExpressionAttributeValues: { ":profileID": profileID },
  };
  const res = await db.query(params).promise();
  return res.Items ? res.Items[0]?.client as IMercadoPagoClient : undefined;
}

export default getClientByProfileID;
