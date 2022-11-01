import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { EventType, UUID } from "../common/types";

const getEventByID = async (db: DocumentClient, TableName: string, eventID: UUID): Promise<EventType> => {
  const params = { TableName, Key: { eventID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as EventType;
};

export default getEventByID;
