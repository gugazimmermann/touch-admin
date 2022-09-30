import { Environment, RemovalPolicy, Stack } from "aws-cdk-lib";
import { AccountRecovery, CfnUserPool, ClientAttributes, StringAttribute, UserPool, UserPoolClient, UserPoolClientIdentityProvider } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

type CognitoConstructProps = {
  env: Environment | undefined;
  ses_noreply_email: string;
  stackName: string;
  stage: string;
};

export class CognitoConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    this.userPool = new UserPool(scope, `${props.stackName}-CognitoUserPool-${props.stage}`, {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      customAttributes: { locale: new StringAttribute({ mutable: true }) },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const cfnUserPool = this.userPool.node.defaultChild as CfnUserPool;
    cfnUserPool.emailConfiguration = {
      emailSendingAccount: 'DEVELOPER',
      replyToEmailAddress: props.ses_noreply_email,
      sourceArn: `arn:aws:ses:${props?.env?.region}:${props?.env?.account}:identity/${props.ses_noreply_email}`,
    };

    const clientReadAttributes = new ClientAttributes().withStandardAttributes({ locale: true });
    const clientWriteAttributes = new ClientAttributes().withStandardAttributes({ locale: true });

    this.userPoolClient = new UserPoolClient(scope, `${props.stackName}-CognitoUserPoolClient-${props.stage}`, {
      userPool: this.userPool,
      authFlows: {
        userPassword: true
      },
      supportedIdentityProviders: [ UserPoolClientIdentityProvider.COGNITO ],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });
  }
}
