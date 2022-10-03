import { Stack } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
} from "aws-cdk-lib/aws-cognito";
import {
  Role,
  FederatedPrincipal,
  PolicyStatement,
  Effect,
} from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

type CognitoRolesConstructProps = {
  userPool: UserPool;
  userPoolClient: UserPoolClient;
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

    this.anonymousCognitoGroupRole = new Role(
      scope,
      `${props.stackName}-CognitoAnonymousGroupRole-${props.stage}`,
      {
        description: "Default role for anonymous users",
        assumedBy: new FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": props.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    this.anonymousCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:DeleteObject",  "s3:GetObject", "s3:PutObject",],
        resources: [
          `arn:aws:s3:::${props.logoAndMapsBucket.bucketName}/public/*`,
        ],
        effect: Effect.ALLOW,
      })
    );

    this.anonymousCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [
          `arn:aws:s3:::${props.logoAndMapsBucket.bucketName}/protected/*`,
        ],
        effect: Effect.ALLOW,
      })
    );

    this.anonymousCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        conditions: {
          StringLike: {
            "s3:prefix": ["public/", "public/*", "protected/", "protected/*"],
          },
        },
        actions: ["s3:ListBucket"],
        resources: [`arn:aws:s3:::${props.logoAndMapsBucket.bucketName}`],
        effect: Effect.ALLOW,
      })
    );

    this.usersCognitoGroupRole = new Role(
      scope,
      `${props.stackName}-CognitoUsersGroupRole-${props.stage}`,
      {
        description: "Default role for authenticated users",
        assumedBy: new FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": props.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    this.usersCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:DeleteObject", "s3:GetObject", "s3:PutObject", ],
        resources: [
          "arn:aws:s3:::" + props.logoAndMapsBucket.bucketName + "/private/${cognito-identity.amazonaws.com:sub}/*",
          "arn:aws:s3:::" + props.logoAndMapsBucket.bucketName + "/protected/${cognito-identity.amazonaws.com:sub}/*",
          `arn:aws:s3:::${props.logoAndMapsBucket.bucketName}/public/*`,
        ],
        effect: Effect.ALLOW,
      })
    );

    this.usersCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [
          "arn:aws:s3:::" + props.logoAndMapsBucket.bucketName + "/protected/*",
        ],
        effect: Effect.ALLOW,
      })
    );

    this.usersCognitoGroupRole.addToPolicy(
      new PolicyStatement({
        conditions: {
          StringLike: {
            "s3:prefix": [
              "public/",
              "public/*",
              "protected/",
              "protected/*",
              "private/${cognito-identity.amazonaws.com:sub}/",
              "private/${cognito-identity.amazonaws.com:sub}/*",
            ],
          },
        },
        actions: ["s3:ListBucket"],
        resources: [`arn:aws:s3:::${props.logoAndMapsBucket.bucketName}`],
        effect: Effect.ALLOW,
      })
    );

    new CfnIdentityPoolRoleAttachment(
      scope,
      `${props.stackName}-IdentityPoolRoleAttachment-${props.stage}`,
      {
        identityPoolId: props.identityPool.ref,
        roles: {
          authenticated: this.usersCognitoGroupRole.roleArn,
          unauthenticated: this.anonymousCognitoGroupRole.roleArn,
        },
        roleMappings: {
          mapping: {
            type: "Token",
            ambiguousRoleResolution: "AuthenticatedRole",
            identityProvider: `cognito-idp.${
              Stack.of(scope).region
            }.amazonaws.com/${props.userPool.userPoolId}:${
              props.userPoolClient.userPoolClientId
            }`,
          },
        },
      }
    );
  }
}
