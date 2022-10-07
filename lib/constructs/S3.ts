import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, HttpMethods, StorageClass } from "aws-cdk-lib/aws-s3";
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
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE],
          allowedOrigins: props.corsDomains,
          exposedHeaders: ["x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2", "ETag"],
          maxAge: 3000
        },
      ],
    });

    this.logoAndMapsBucket.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [`${this.logoAndMapsBucket.bucketArn}/public/*`],
    }));
  }
}
