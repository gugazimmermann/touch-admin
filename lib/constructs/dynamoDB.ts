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
  public readonly referralTable: Table;
  public readonly eventsTable: Table;

  constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    this.plansTable = new Table(scope, `${props.stackName}-PlansTable-${props.stage}`, {
      partitionKey: { name: "planID", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.profileTable = new Table(scope, `${props.stackName}-ProfileTable-${props.stage}`, {
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.referralTable = new Table(scope, `${props.stackName}-ReferralTable-${props.stage}`, {
      partitionKey: { name: "referralID", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.referralTable.addGlobalSecondaryIndex({
      indexName: "byCode",
      partitionKey: { name: "code", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.eventsTable = new Table(scope, `${props.stackName}-EventsTable-${props.stage}`, {
      partitionKey: { name: "eventsID", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.eventsTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
