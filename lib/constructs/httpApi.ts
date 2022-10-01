import { HttpApi, CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

type HttpApiConstructProps = {
  userPool: UserPool;
  userPoolClient: UserPoolClient;
  stackName: string;
  stage: string;
};

export class HttpApiConstruct extends Construct {
  public readonly httpApi: HttpApi;
  public readonly authorizer: HttpUserPoolAuthorizer;
  
  constructor(scope: Construct, id: string, props: HttpApiConstructProps) {
    super(scope, id);

    this.httpApi = new HttpApi(scope, `${props.stackName}-HttpApi-${props.stage}`, {
      description: `${props.stackName} HttpApi ${props.stage}`,
      corsPreflight: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: [
          'http://localhost:3000',
          'https://wwww.touchsistemas.com.br',
          'https://touchsistemas.com.br',
          'https://admin.touchsistemas.com.br'
        ],
      },
    });

    this.authorizer = new HttpUserPoolAuthorizer(
      `${props.stackName}-UserPoolAuthorizer-${props.stage}`,
      props.userPool,
      {
        userPoolClients: [ props.userPoolClient ],
        identitySource: [ '$request.header.Authorization' ],
      },
    );
  }
}
