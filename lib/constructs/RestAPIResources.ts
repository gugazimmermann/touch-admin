import { CognitoUserPoolsAuthorizer, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type RestAPIResourcesConstructProps = {
  restApi: RestApi;
  authorizer: CognitoUserPoolsAuthorizer;
  plansLambda: NodejsFunction;
  profileLambda: NodejsFunction;
  referralsLambda: NodejsFunction;
  eventsLambda: NodejsFunction;
  stackName: string;
  stage: string;
};

export class RestAPIResourcesConstruct extends Construct {
  constructor(scope: Construct, id: string, props: RestAPIResourcesConstructProps) {
    super(scope, id);

    const plans = props.restApi.root.addResource('plans');
    plans.addMethod('GET', new LambdaIntegration(props.plansLambda));

    const profilesResource = props.restApi.root.addResource('profiles');
    profilesResource.addMethod('GET', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profilesResource.addMethod('POST', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profilesResource.addMethod('PUT', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const profileIDResource = profilesResource.addResource('{profileID}');
    profileIDResource.addMethod('GET', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profileIDResource.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profileIDResource.addMethod('DELETE', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const logomap = profileIDResource.addResource('logomap');
    logomap.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const owners = profileIDResource.addResource('owners');
    owners.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });

    const referralsResource = props.restApi.root.addResource('referrals');
    referralsResource.addMethod('GET', new LambdaIntegration(props.referralsLambda), { authorizer: props.authorizer });
    const referralsByCodeIDResource = referralsResource.addResource('byCodeID');
    const referralsByCodeIDCodeResource = referralsByCodeIDResource.addResource('{code}');
    referralsByCodeIDCodeResource.addMethod('GET', new LambdaIntegration(props.referralsLambda), { authorizer: props.authorizer });
    const referralsByIDResource = referralsResource.addResource('byReferralID');
    const referralsIDResource = referralsByIDResource.addResource('{referralID}');
    referralsIDResource.addMethod('GET', new LambdaIntegration(props.referralsLambda), { authorizer: props.authorizer });

    const eventsResource = props.restApi.root.addResource('events');
    eventsResource.addMethod('POST', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    eventsResource.addMethod('PUT', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsByIDResource = eventsResource.addResource('byEventID');
    const eventsByIDEventIDResource = eventsByIDResource.addResource('{eventID}');
    eventsByIDEventIDResource.addMethod('GET', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsByProfileIDResource = eventsResource.addResource('byProfileID');
    const eventProfileIDResource = eventsByProfileIDResource.addResource('{profileID}');
    eventProfileIDResource.addMethod('GET', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventIDResource = eventsResource.addResource('{eventID}');
    const eventIDLogoMap = eventIDResource.addResource('logomap');
    eventIDLogoMap.addMethod('PATCH', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
  }
}
