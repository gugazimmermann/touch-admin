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
  surveysLambda: NodejsFunction;
  stackName: string;
  stage: string;
};

export class RestAPIResourcesConstruct extends Construct {
  constructor(scope: Construct, id: string, props: RestAPIResourcesConstructProps) {
    super(scope, id);

    const plans = props.restApi.root.addResource('plans');
    plans.addMethod('GET', new LambdaIntegration(props.plansLambda));

    const profilesResource = props.restApi.root.addResource('profiles');
    profilesResource.addMethod('POST', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profilesResource.addMethod('PUT', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const profilesResourceProfileIDVar = profilesResource.addResource('{profileID}');
    profilesResourceProfileIDVar.addMethod('GET', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    profilesResourceProfileIDVar.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const profilesResourceProfileIDResourceLogoMapResource = profilesResourceProfileIDVar.addResource('logomap');
    profilesResourceProfileIDResourceLogoMapResource.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    const profilesResourceProfileIDResourceOwnersResource = profilesResourceProfileIDVar.addResource('owners');
    profilesResourceProfileIDResourceOwnersResource.addMethod('PATCH', new LambdaIntegration(props.profileLambda), { authorizer: props.authorizer });
    
    const referralsResource = props.restApi.root.addResource('referrals');
    referralsResource.addMethod('GET', new LambdaIntegration(props.referralsLambda), { authorizer: props.authorizer });
    const referralsResourceByCodeResource = referralsResource.addResource('byCodeID');
    const referralsResourceByCodeResourceCodeVar = referralsResourceByCodeResource.addResource('{code}');
    referralsResourceByCodeResourceCodeVar.addMethod('GET', new LambdaIntegration(props.referralsLambda), { authorizer: props.authorizer });
    const referralsResourceByReferralIDResource = referralsResource.addResource('byReferralID');
    const referralsResourceByReferralIDResourceReferralIDVar = referralsResourceByReferralIDResource.addResource('{referralID}');
    referralsResourceByReferralIDResourceReferralIDVar.addMethod('GET', new LambdaIntegration(props.referralsLambda), { authorizer: props.authorizer });
    const eventsResource = props.restApi.root.addResource('events');
    eventsResource.addMethod('POST', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    eventsResource.addMethod('PUT', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsResourceEventIDVar = eventsResource.addResource('{eventID}');
    eventsResourceEventIDVar.addMethod('GET', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsResourceEventIDVarLogoMapResource = eventsResourceEventIDVar.addResource('logomap');
    eventsResourceEventIDVarLogoMapResource.addMethod('PATCH', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsResourceEventIDVarMethodResource = eventsResourceEventIDVar.addResource('method');
    eventsResourceEventIDVarMethodResource.addMethod('PATCH', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsResourceByProfileIDResource = eventsResource.addResource('byProfileID');
    const eventsResourceByProfileIDResourceProfileIDVar = eventsResourceByProfileIDResource.addResource('{profileID}');
    eventsResourceByProfileIDResourceProfileIDVar.addMethod('GET', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    const eventsResourceByProfileIDResourceProfileIDVarPlanTypeVar = eventsResourceByProfileIDResourceProfileIDVar.addResource('{planType}')
    eventsResourceByProfileIDResourceProfileIDVarPlanTypeVar.addMethod('GET', new LambdaIntegration(props.eventsLambda), { authorizer: props.authorizer });
    
    const surveysResource = props.restApi.root.addResource('surveys');
    surveysResource.addMethod('POST', new LambdaIntegration(props.surveysLambda), { authorizer: props.authorizer });
    const surveysResourceSurveyIDVar = surveysResource.addResource('{surveyID}');
    surveysResourceSurveyIDVar.addMethod('GET', new LambdaIntegration(props.surveysLambda), { authorizer: props.authorizer });
    const surveysResourceByEventIDResource = surveysResource.addResource('byEventID');
    const surveysResourceByEventIDResourceEventIDVar = surveysResourceByEventIDResource.addResource('{eventID}');
    surveysResourceByEventIDResourceEventIDVar.addMethod('GET', new LambdaIntegration(props.surveysLambda), { authorizer: props.authorizer });
    const surveysResourceByProfileIDResource = surveysResource.addResource('byProfileID');
    const surveysResourceByProfileIDResourceProfileIDVar = surveysResourceByProfileIDResource.addResource('{profileID}');
    surveysResourceByProfileIDResourceProfileIDVar.addMethod('GET', new LambdaIntegration(props.surveysLambda), { authorizer: props.authorizer });
  }
}
