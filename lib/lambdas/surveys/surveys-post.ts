import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { SurveyAnswerType, SurveyQuestionType, SurveyType } from '../common/types';
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";


const surveysPost = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  TableName: string
): Promise<APIGatewayProxyResult> => {
  const body: SurveyType = event?.body ? JSON.parse(event.body) : null;

  if (
    !body ||
    !body.profileID ||
    !body.language ||
    (!body.questions || !body.questions.length)
  )
    return commonResponse(
      400,
      JSON.stringify({ message: "Missing Data", requestID })
    );

  const dateNow = Date.now().toString();

  const questions: SurveyQuestionType[] = body.questions.map(q => {
    const answerFormated: SurveyAnswerType[] = q.answers.map(a => ({
      ...a,
      createdAt: dateNow,
      updatedAt: dateNow
    }));
    return {
      ...q,
      answers: answerFormated,
      createdAt: dateNow,
      updatedAt: dateNow
    }
  })

  const surveyData: SurveyType = {
    profileID: body.profileID,
    language: body.language,
    questions: questions,
    createdAt: dateNow,
    updatedAt: dateNow,
    deleteddAt: "",
  };

  const params = { TableName, Item: surveyData };
  console.debug(`params`, JSON.stringify(params, undefined, 2));

  try {
    await db.put(params).promise();
    return commonResponse(201, JSON.stringify({ data: surveyData, requestID }));
  } catch (error) {
    console.error(`error`, JSON.stringify(error, undefined, 2));
    return commonResponse(500, JSON.stringify({ error, requestID }));
  }
};

export default surveysPost;
