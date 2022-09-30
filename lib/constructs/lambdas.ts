import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import commonLambdaProps from "./common/commonLambdaProps";

type LambdasConstructProps = {
  profileTable: Table;
  stackName: string;
  stage: string;
};

export class LambdasConstruct extends Construct {
  public readonly profileLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdasConstructProps) {
    super(scope, id);

    this.profileLambda = new NodejsFunction(scope, "ProfileLambda", {
      entry: join(__dirname, "..", "lambdas", "profile.ts"), ...commonLambdaProps
    });
    props.profileTable.grantReadWriteData(this.profileLambda);
    this.profileLambda.addEnvironment("TABLE_NAME", props.profileTable.tableName)
  }
}
