import AWS = require("aws-sdk");
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import commonResponse from "../common/commonResponse";

const db = new AWS.DynamoDB.DocumentClient();

const profilePut = async (
  event: APIGatewayEvent,
  requestID: string,
  TableName: string
): Promise<APIGatewayProxyResult> => {
  const body = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.profileID || !body.email)
    return commonResponse(
      400,
      JSON.stringify({ message: "Missing Data", requestID })
    );

  const dateNow = Date.now().toString();

  const params = {
    TableName,
    Key: { profileID: body.profileID },
    UpdateExpression:
      "set #phone = :phone, #name = :name, #documenttype = :documenttype, #document = :document, #zipCode = :zipCode, #state = :state, #city = :city, #district = :district, #street = :street, #number = :number, #complement = :complement, #website = :website, #logo = :logo, #map = :map, #updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":phone": body.phone,
      ":name": body.name,
      ":documenttype": body.documenttype,
      ":document": body.document,
      ":zipCode": body.zipCode,
      ":state": body.state,
      ":city": body.city,
      ":district": body.district,
      ":street": body.street,
      ":number": body.number,
      ":complement": body.complement,
      ":website": body.website,
      ":logo": body.logo,
      ":map": body.map,
      ":updatedAt": dateNow,
    },
    ExpressionAttributeNames: {
      "#phone": "phone",
      "#name": "name",
      "#documenttype": "documenttype",
      "#document": "document",
      "#zipCode": "zipCode",
      "#state": "state",
      "#city": "city",
      "#district": "district",
      "#street": "street",
      "#number": "number",
      "#complement": "complement",
      "#website": "website",
      "#logo": "logo",
      "#map": "map",
      "#updatedAt": "updatedAt",
    },
    ReturnValues: "ALL_NEW",
  };
  console.debug(`params`, JSON.stringify(params, undefined, 2));

  try {
    const res = await db.update(params).promise();
    return commonResponse(
      200,
      JSON.stringify({ data: res.Attributes, requestID })
    );
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
};

export default profilePut;
