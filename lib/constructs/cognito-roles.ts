import { Stack } from "aws-cdk-lib";
import { UserPool, UserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment } from "aws-cdk-lib/aws-cognito";
import { Role, FederatedPrincipal, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

type CognitoRolesConstructProps = {
  userPool: UserPool;
  userPoolClient: UserPoolClient
  identityPool: CfnIdentityPool;
  logoAndMapsBucket: Bucket;
  stackName: string;
  stage: string;
};

export class CognitoRolesConstruct extends Construct {
  public readonly anonymousCognitoGroupRole: Role;
  public readonly usersCognitoGroupRole: Role;

  constructor(scope: Construct, id: string, props: CognitoRolesConstructProps) {
    super(scope, id);

    this.anonymousCognitoGroupRole = new Role(scope, `${props.stackName}-CognitoAnonymousGroupRole-${props.stage}`, {
      description: 'Default role for anonymous users',
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': props.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    this.anonymousCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:Get*", "s3:List*"],
        resources: [props.logoAndMapsBucket.bucketArn],
      })
    );

    this.usersCognitoGroupRole = new Role(scope, `${props.stackName}-CognitoUsersGroupRole-${props.stage}`, {
      description: 'Default role for authenticated users',
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': props.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    this.usersCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:Get*", "s3:List*", "s3:PutObject", "s3:PutObjectAcl"],
        resources: [props.logoAndMapsBucket.bucketArn],
      })
    );

    new CfnIdentityPoolRoleAttachment(scope, `${props.stackName}-IdentityPoolRoleAttachment-${props.stage}`, {
      identityPoolId: props.identityPool.ref,
      roles: {
        authenticated: this.usersCognitoGroupRole.roleArn,
        unauthenticated: this.anonymousCognitoGroupRole.roleArn,
      },
      roleMappings: {
        mapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `cognito-idp.${Stack.of(scope).region}.amazonaws.com/${props.userPool.userPoolId}:${props.userPoolClient.userPoolClientId}`,
        },
      },
    });

  }
}
