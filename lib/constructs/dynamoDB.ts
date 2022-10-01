import { RemovalPolicy } from "aws-cdk-lib";
import { Table, AttributeType, BillingMode, ProjectionType } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

type DynamoDBConstructProps = {
  stackName: string;
  stage: string;
};

export class DynamoDBConstruct extends Construct {
  public readonly plansTable: Table;
  public readonly profileTable: Table;

  constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    this.plansTable = new Table(scope, "PlansTable", {
      partitionKey: { name: "planID", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.profileTable = new Table(scope, "ProfileTable", {
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
