import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { SurveyAnswerType, SurveyQuestionType, SurveySimpleType, SurveyType } from '../common/types';
import commonResponse from "../common/commonResponse";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";


const surveysPost = async (
  db: DocumentClient,
  event: APIGatewayEvent,
  requestID: string,
  SURVEYS_TABLE: string
): Promise<APIGatewayProxyResult> => {
  const body: SurveyType = event?.body ? JSON.parse(event.body) : null;

  if (!body || !body.profileID || !body.eventID) return commonResponse(400, JSON.stringify({ message: "Missing Data", requestID }));

  const dateNow = Date.now().toString();

  const survey: SurveySimpleType = body.surveys[0]

  const questions: SurveyQuestionType[] = survey.questions.map(q => {
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

  const simpleSurvey: SurveySimpleType[] = [];
  simpleSurvey.push({
    language: survey.language,
    questions: questions,
  })

  const surveyData: SurveyType = {
    surveyID: uuidv4(),
    profileID: body.profileID,
    eventID: body.eventID,
    surveys: simpleSurvey,
    createdAt: dateNow,
    updatedAt: dateNow,
    deletedAt: "",
  };

  const params = { TableName: SURVEYS_TABLE, Item: surveyData };
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
