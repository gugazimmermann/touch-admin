import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UUID, ProfileType } from "../common/types";

const getProfileByID = async (db: DocumentClient, profileID: UUID, TableName: string): Promise<ProfileType> => {
  const params = { TableName, Key: { profileID } };
  const res = await db.get(params).promise();
  return (res.Item || {}) as ProfileType;
};

export default getProfileByID;
