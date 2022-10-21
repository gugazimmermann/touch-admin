import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import * as dotenv from 'dotenv';
import commonLambdaProps from "./common/commonLambdaProps";
import { Duration } from "aws-cdk-lib";

dotenv.config();

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const MERCADO_PAGO_ACCESS_TOKEN_TEST = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || '';

type LambdasConstructProps = {
  plansTable: Table;
  profileTable: Table;
  referralTable: Table;
  eventsTable: Table;
  surveysTable: Table;
  stackName: string;
  stage: string;
};

export class LambdasConstruct extends Construct {
  public readonly cognitoLambda: NodejsFunction;
  public readonly plansLambda: NodejsFunction;
  public readonly profileLambda: NodejsFunction;
  public readonly referralsLambda: NodejsFunction;
  public readonly eventsLambda: NodejsFunction;
  public readonly surveysLambda: NodejsFunction;
  public readonly mercadoPagoLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdasConstructProps) {
    super(scope, id);

    this.cognitoLambda = new NodejsFunction(scope, `${props.stackName}-CognitoLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "cognito.ts"),
      ...commonLambdaProps,
    });

    this.plansLambda = new NodejsFunction(scope, `${props.stackName}-PlansLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "plans.ts"),
      ...commonLambdaProps,
    });
    props.plansTable.grantReadData(this.plansLambda);
    this.plansLambda.addEnvironment("TABLE_NAME", props.plansTable.tableName);

    this.profileLambda = new NodejsFunction(scope, `${props.stackName}-ProfileLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "profile.ts"),
      ...commonLambdaProps,
    });
    props.profileTable.grantReadWriteData(this.profileLambda);
    this.profileLambda.addEnvironment("TABLE_NAME", props.profileTable.tableName);

    this.referralsLambda = new NodejsFunction(scope, `${props.stackName}-ReferralsLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "referrals.ts"),
      ...commonLambdaProps,
    });
    props.referralTable.grantReadData(this.referralsLambda);
    this.referralsLambda.addEnvironment("TABLE_NAME", props.referralTable.tableName);

    this.eventsLambda = new NodejsFunction(scope, `${props.stackName}-EventsLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "events.ts"),
      ...commonLambdaProps,
    });
    props.eventsTable.grantReadWriteData(this.eventsLambda);
    this.eventsLambda.addEnvironment("TABLE_NAME", props.eventsTable.tableName);

    this.surveysLambda = new NodejsFunction(scope, `${props.stackName}-SurveysLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "surveys.ts"),
      ...commonLambdaProps,
    });
    props.surveysTable.grantReadWriteData(this.surveysLambda);
    this.surveysLambda.addEnvironment("TABLE_NAME", props.surveysTable.tableName);

    this.mercadoPagoLambda = new NodejsFunction(scope, `${props.stackName}-MercadoPagoLambda-${props.stage}`, {
      entry: join(__dirname, "..", "lambdas", "mercadopago.ts"),
      ...commonLambdaProps,
      timeout: Duration.minutes(1),
      memorySize: 512
    });
    props.profileTable.grantReadWriteData(this.mercadoPagoLambda);
    this.mercadoPagoLambda.addEnvironment("TABLE_NAME", props.profileTable.tableName);
    this.mercadoPagoLambda.addEnvironment("MERCADO_PAGO_ACCESS_TOKEN", MERCADO_PAGO_ACCESS_TOKEN);
    this.mercadoPagoLambda.addEnvironment("MERCADO_PAGO_ACCESS_TOKEN_TEST", MERCADO_PAGO_ACCESS_TOKEN_TEST);
  }
}
