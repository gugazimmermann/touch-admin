import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import commonLambdaProps from "./common/commonLambdaProps";

type LambdasConstructProps = {
  plansTable: Table;
  profileTable: Table;
  stackName: string;
  stage: string;
};

export class LambdasConstruct extends Construct {
  public readonly plansLambda: NodejsFunction;
  public readonly profileLambda: NodejsFunction;
  public readonly profileOwnersLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdasConstructProps) {
    super(scope, id);

    this.plansLambda = new NodejsFunction(scope, "PlansLambda", {
      entry: join(__dirname, "..", "lambdas", "plans.ts"), ...commonLambdaProps
    });
    props.plansTable.grantReadData(this.plansLambda);
    this.plansLambda.addEnvironment("TABLE_NAME", props.plansTable.tableName)

    this.profileLambda = new NodejsFunction(scope, "ProfileLambda", {
      entry: join(__dirname, "..", "lambdas", "profile.ts"), ...commonLambdaProps
    });
    props.profileTable.grantReadWriteData(this.profileLambda);
    this.profileLambda.addEnvironment("TABLE_NAME", props.profileTable.tableName)

    this.profileOwnersLambda = new NodejsFunction(scope, "ProfileOwnersLambda", {
      entry: join(__dirname, "..", "lambdas", "profile-owners.ts"), ...commonLambdaProps
    });
    props.profileTable.grantReadWriteData(this.profileOwnersLambda);
    this.profileOwnersLambda.addEnvironment("TABLE_NAME", props.profileTable.tableName)
  }
}
