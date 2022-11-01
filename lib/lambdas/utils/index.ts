import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UUID, ProfileType, EventType, PlanType } from "../common/types";

export const getProfileByID = async (db: DocumentClient, profileID: UUID, TableName: string): Promise<ProfileType> => {
  const params = { TableName, Key: { profileID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as ProfileType;
};

export const getEventByID = async (db: DocumentClient, eventID: UUID, TableName: string): Promise<EventType> => {
  const params = { TableName, Key: { eventID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as EventType;
};

export const gePlanByID = async (db: DocumentClient, planID: UUID, TableName: string): Promise<PlanType> => {
  const params = { TableName, Key: { planID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as PlanType;
};