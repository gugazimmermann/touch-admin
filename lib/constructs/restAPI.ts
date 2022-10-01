import {
  CognitoUserPoolsAuthorizer,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

type RestApiConstructProps = {
  userPool: UserPool;
  stackName: string;
  stage: string;
};

export class RestApiConstruct extends Construct {
  public readonly restApi: RestApi;
  public readonly authorizer: CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: RestApiConstructProps) {
    super(scope, id);

    this.restApi = new RestApi(
      scope,
      `${props.stackName}-RestApi-${props.stage}`,
      {
        description: `${props.stackName} RestApi ${props.stage}`,
        deployOptions: {
          stageName: "dev",
          dataTraceEnabled: true,
          tracingEnabled: true,
        },
        defaultCorsPreflightOptions: {
          allowHeaders: ["Content-Type",  "X-Amz-Date", "Authorization", "X-Api-Key"],
          allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
          allowCredentials: true,
          allowOrigins: [
            "http://localhost:3000",
            "https://d1aewi60iom71h.cloudfront.net/",
            "https://wwww.touchsistemas.com.br",
            "https://touchsistemas.com.br",
            "https://admin.touchsistemas.com.br",
          ],
        },
      }
    );

    this.authorizer = new CognitoUserPoolsAuthorizer(
      scope,
      `${props.stackName}-UserPoolAuthorizer-${props.stage}`,
      { cognitoUserPools: [props.userPool] }
    );
  }
}
