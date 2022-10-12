import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDBConstruct } from "./constructs/dynamoDB";
import { LambdasConstruct } from "./constructs/lambdas";
import { CognitoConstruct } from "./constructs/cognito";
import { RestApiConstruct } from "./constructs/restAPI";
import { RestAPIResourcesConstruct } from "./constructs/RestAPIResources";
import { S3Construct } from "./constructs/S3";
import { CognitoRolesConstruct } from "./constructs/cognito-roles";
import { corsDomains } from "./constructs/common/cors";

export interface AdminStackProps extends cdk.StackProps {
  stackName: string;
  stage: string;
  ses_noreply_email: string;
}

export class AdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AdminStackProps) {
    super(scope, id, props);

    const { env, stackName, stage, ses_noreply_email } = props;

    const {
      plansTable,
      profileTable,
      referralTable,
      eventsTable,
      surveysTable
    } = new DynamoDBConstruct(this, "DynamoDBConstruct", { stackName, stage });

    const { logoAndMapsBucket } = new S3Construct(this, "S3Construct", {
      corsDomains,
      stackName,
      stage,
    });

    const {
      cognitoLambda,
      plansLambda,
      profileLambda,
      referralsLambda,
      eventsLambda,
      surveysLambda
    } = new LambdasConstruct(this, "LambdasConstruct", {
      plansTable,
      profileTable,
      referralTable,
      eventsTable,
      surveysTable,
      stackName,
      stage,
    });

    const { userPool, userPoolClient, identityPool } = new CognitoConstruct(
      this,
      "CognitoConstruct",
      { env, ses_noreply_email, cognitoLambda, stackName, stage }
    );

    new CognitoRolesConstruct(this, "CognitoRolesConstruct", {
      userPool,
      userPoolClient,
      identityPool,
      logoAndMapsBucket,
      stackName,
      stage,
    });

    const { restApi, authorizer } = new RestApiConstruct(
      this,
      "RestApiConstruct",
      { userPool, corsDomains, stackName, stage }
    );

    new RestAPIResourcesConstruct(this, "RestAPIResourcesConstruct", {
      restApi,
      authorizer,
      plansLambda,
      profileLambda,
      referralsLambda,
      eventsLambda,
      surveysLambda,
      stackName,
      stage,
    });

    new cdk.CfnOutput(this, "Plans Table Name", {
      value: plansTable.tableName,
    });
    new cdk.CfnOutput(this, "Referrals Table Name", {
      value: referralTable.tableName,
    });
    new cdk.CfnOutput(this, "Logo And Maps Bucket", {
      value: logoAndMapsBucket.bucketName,
    });
    new cdk.CfnOutput(this, "userPool ID", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "userPool Client ID", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
