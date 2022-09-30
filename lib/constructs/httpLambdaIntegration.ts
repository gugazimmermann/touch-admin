import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type httpLambdaIntegrationConstructProps = {
  httpApi: HttpApi;
  authorizer: HttpUserPoolAuthorizer;
  profileLambda: NodejsFunction;
  stackName: string;
  stage: string;
};

export class httpLambdaIntegrationConstruct extends Construct {
  constructor(scope: Construct, id: string, props: httpLambdaIntegrationConstructProps) {
    super(scope, id);

    props.httpApi.addRoutes({
      authorizer: props.authorizer,
      path: '/profiles',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(`profiles-get-integration`, props.profileLambda)
    });

    props.httpApi.addRoutes({
      authorizer: props.authorizer,
      path: '/profiles/{profileID}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(`profiles-get-one-integration`, props.profileLambda)
    });

    props.httpApi.addRoutes({
      authorizer: props.authorizer,
      path: '/profiles',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('profiles-post-integration', props.profileLambda)
    });

    props.httpApi.addRoutes({
      authorizer: props.authorizer,
      path: '/profiles',
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration('profiles-put-integration', props.profileLambda)
    });

    props.httpApi.addRoutes({
      authorizer: props.authorizer,
      path: '/profiles',
      methods: [HttpMethod.PATCH],
      integration: new HttpLambdaIntegration('profiles-patch-integration', props.profileLambda)
    });

    props.httpApi.addRoutes({
      authorizer: props.authorizer,
      path: '/profiles/{profileID}',
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration('profiles-delete-integration', props.profileLambda)
    });
  }
}
