import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDBConstruct } from "./constructs/dynamoDB";
import { LambdasConstruct } from "./constructs/lambdas";
import { CognitoConstruct } from "./constructs/cognito";
import { RestApiConstruct } from "./constructs/restAPI";
import { RestAPIResourcesConstruct } from "./constructs/RestAPIResources";

export interface AdminStackProps extends cdk.StackProps {
  stackName: string;
  stage: string;
  ses_noreply_email: string;
}

export class AdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AdminStackProps) {
    super(scope, id, props);

    const { env, stackName, stage, ses_noreply_email } = props;

    const { plansTable, profileTable } = new DynamoDBConstruct(this, "DynamoDBConstruct", { stackName, stage });

    const { userPool, userPoolClient } = new CognitoConstruct(this, "CognitoConstruct", { env, stackName, stage, ses_noreply_email });

    const { restApi, authorizer } = new RestApiConstruct(this, "RestApiConstruct", { userPool, stackName, stage });

    const { plansLambda, profileLambda, profileOwnersLambda } = new LambdasConstruct(this, "LambdasConstruct", { plansTable, profileTable, stackName, stage });

    new RestAPIResourcesConstruct(this, "RestAPIResourcesConstruct", {
      restApi,
      authorizer,
      plansLambda,
      profileLambda,
      profileOwnersLambda,
      stackName,
      stage,
    });

    new cdk.CfnOutput(this, "Plans Table Name", {
      value: plansTable.tableName,
    });
    new cdk.CfnOutput(this, "userPool ID", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "userPool Client ID", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
