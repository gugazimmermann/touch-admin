import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  CognitoUserPoolsAuthorizer,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
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

    const restApiLogGroup = new LogGroup(scope, `${props.stackName}-restApiLogGroup-${props.stage}`, {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_MONTH
    });

    this.restApi = new RestApi(
      scope,
      `${props.stackName}-RestApi-${props.stage}`,
      {
        description: `${props.stackName} RestApi ${props.stage}`,
        cloudWatchRole: true,

        deployOptions: {
          stageName: "dev",
          dataTraceEnabled: true,
          tracingEnabled: true,
          metricsEnabled: true,
          loggingLevel: MethodLoggingLevel.INFO,
          accessLogDestination: new LogGroupLogDestination(restApiLogGroup),
          accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
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
