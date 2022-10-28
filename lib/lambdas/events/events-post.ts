import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { EventType, ReferralType } from '../common/types';
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PLANSTYPES } from '../common/enums';

const getReferralByCode = async (db: DocumentClient, code: string, REFERRAL_TABLE: string): Promise<ReferralType> => {
  const params = {
    TableName: REFERRAL_TABLE,
    IndexName: "byCode",
    KeyConditionExpression: "#code = :code",
    ExpressionAttributeNames: { "#code": "code" },
    ExpressionAttributeValues: { ":code": code },
  };
  console.debug(`getReferralByCode params`, JSON.stringify(params, undefined, 2));
  const res = await db.query(params).promise();
  const referral = res.Items && res.Items.length ? res.Items[0] : {};
  return referral as ReferralType;
}

const eventsPost = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  EVENTS_TABLE: string,
  REFERRAL_TABLE: string
): Promise<APIGatewayProxyResult> => {
  const body: EventType = event?.body ? JSON.parse(event.body) : null;

  if (
    !body ||
    !body.profileID ||
    !body.planType ||
    !body.name ||
    !body.zipCode ||
    !body.state ||
    !body.city ||
    (body.planType !== PLANSTYPES.SUBSCRIPTION && !body.dates.length) ||
    !body.method ||
    (!body.gift && body.gift !== 0) ||
    (!body.prizeDraw && body.prizeDraw !== 0)
  )
    return commonResponse(
      400,
      JSON.stringify({ message: "Missing Data", requestID })
    );

  const dateNow = Date.now().toString();
  const eventData: EventType = {
    eventID: uuidv4(),
    profileID: body.profileID,
    planType: body.planType,
    plan: body.plan,
    'profileID#PlanType': body['profileID#PlanType'],
    name: body.name,
    email: body.email,
    website: body.website,
    zipCode: body.zipCode,
    state: body.state,
    city: body.city,
    district: body.district,
    street: body.street,
    number: body.number,
    complement: body.complement,
    dates: body.dates,
    method: body.method,
    gift: body.gift,
    prizeDraw: body.prizeDraw,
    referralCode: body.referralCode,
    logo: body.logo,
    map: body.map,
    giftDescription: body.giftDescription,
    prizeDrawDescription: body.prizeDrawDescription,
    description: body.description,
    createdAt: dateNow,
    updatedAt: dateNow,
    deletedAt: "",
  };

  if (eventData.referralCode) {
    const referral = await getReferralByCode(db, eventData.referralCode, REFERRAL_TABLE);
    eventData.referral = referral;
  }

  const params = { TableName: EVENTS_TABLE, Item: eventData };
  console.debug(`params`, JSON.stringify(params, undefined, 2));

  try {
    await db.put(params).promise();
    return commonResponse(201, JSON.stringify({ data: eventData, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
};

export default eventsPost;
