import { Duration, RemovalPolicy } from "aws-cdk-lib";
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

    this.logoAndMapsBucket = new Bucket(this, 'MyBucket', {
      versioned: false,
      publicReadAccess: true,
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
  }
}
