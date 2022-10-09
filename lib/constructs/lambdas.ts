import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import commonLambdaProps from "./common/commonLambdaProps";

type LambdasConstructProps = {
  plansTable: Table;
  profileTable: Table;
  referralTable: Table;
  eventsTable: Table;
  stackName: string;
  stage: string;
};

export class LambdasConstruct extends Construct {
  public readonly cognitoLambda: NodejsFunction;
  public readonly plansLambda: NodejsFunction;
  public readonly profileLambda: NodejsFunction;
  public readonly referralsLambda: NodejsFunction;
  public readonly eventsLambda: NodejsFunction;

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
  }
}
