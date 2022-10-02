import { CognitoUserPoolsAuthorizer, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type RestAPIResourcesConstructProps = {
  restApi: RestApi;
  authorizer: CognitoUserPoolsAuthorizer;
  plansLambda: NodejsFunction;
  profileLambda: NodejsFunction;
  stackName: string;
  stage: string;
};

export class RestAPIResourcesConstruct extends Construct {
  constructor(scope: Construct, id: string, props: RestAPIResourcesConstructProps) {
    super(scope, id);

    const plans = props.restApi.root.addResource('plans');
    plans.addMethod('GET', new LambdaIntegration(props.plansLambda));

    const profiles = props.restApi.root.addResource('profiles');
    profiles.addMethod('GET', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profiles.addMethod('POST', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profiles.addMethod('PUT', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });

    const profileID = profiles.addResource('{profileID}');
    profileID.addMethod('GET', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profileID.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profileID.addMethod('DELETE', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const owners = profileID.addResource('owners');
    owners.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
  }
}
