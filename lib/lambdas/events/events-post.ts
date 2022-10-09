import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { EventType } from '../common/types';
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const eventsPost = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  TableName: string
): Promise<APIGatewayProxyResult> => {
  const body: EventType = event?.body ? JSON.parse(event.body) : null;

  if (
    !body ||
    !body.profileID ||
    !body.name ||
    !body.zipCode ||
    !body.state ||
    !body.city ||
    !body.dates.length ||
    !body.method ||
    !body.gift ||
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
    referral: body.referral,
    logo: body.logo,
    map: body.map,
    giftDescription: body.giftDescription,
    prizeDrawDescription: body.prizeDrawDescription,
    description: body.description,
    createdAt: dateNow,
    updatedAt: dateNow,
    deleteddAt: "",
  };

  const params = { TableName, Item: eventData };
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
