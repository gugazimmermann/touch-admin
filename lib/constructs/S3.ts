import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Effect, PolicyStatement, StarPrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket, BucketPolicy, HttpMethods, StorageClass } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

type S3ConstructProps = {
  corsDomains: string[];
  stackName: string;
  stage: string;
};

export class S3Construct extends Construct {
  public readonly logoAndMapsBucket: Bucket;

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);

    this.logoAndMapsBucket = new Bucket(scope, `${props.stackName}-LogoAndMapsBucket-${props.stage}`, {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: Duration.days(10),
          transitions: [
            {
              storageClass: StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(60),
            },
            {
              storageClass: StorageClass.GLACIER,
              transitionAfter: Duration.days(180),
            }
          ],
        },
      ],
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
          allowedOrigins: props.corsDomains,
          allowedHeaders: ['*'],
        },
      ],
    });

    const logoAndMapsBucketPolicy = new BucketPolicy(scope, `${props.stackName}-LogoAndMapsBucketPolicy-${props.stage}`, {
      bucket: this.logoAndMapsBucket
    });

    logoAndMapsBucketPolicy.document.addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new StarPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.logoAndMapsBucket.bucketArn}/public/*`],
      }),
    );

  }
}
