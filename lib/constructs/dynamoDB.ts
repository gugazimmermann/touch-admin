import { RemovalPolicy } from "aws-cdk-lib";
import { Table, AttributeType, BillingMode, ProjectionType } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

type DynamoDBConstructProps = {
  stackName: string;
  stage: string;
};

export class DynamoDBConstruct extends Construct {
  public readonly profileTable: Table;

  constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    this.profileTable = new Table(
      scope,
      "ProfileTable",
      {
        partitionKey: { name: "profileID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.profileTable.addGlobalSecondaryIndex({
      indexName: "byEmail",
      partitionKey: { name: "email", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
