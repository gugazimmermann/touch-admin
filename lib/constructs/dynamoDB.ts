import { RemovalPolicy } from "aws-cdk-lib";
import {
  Table,
  AttributeType,
  BillingMode,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
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
  public readonly eventsPaymentsTable: Table;
  public readonly subscriptionsPaymentsTable: Table;
  public readonly surveysTable: Table;

 constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    this.plansTable = new Table(
      scope,
      `${props.stackName}-PlansTable-${props.stage}`,
      {
        partitionKey: { name: "planID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    this.profileTable = new Table(
      scope,
      `${props.stackName}-ProfileTable-${props.stage}`,
      {
        partitionKey: { name: "profileID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    this.referralTable = new Table(
      scope,
      `${props.stackName}-ReferralTable-${props.stage}`,
      {
        partitionKey: { name: "referralID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.referralTable.addGlobalSecondaryIndex({
      indexName: "byCode",
      partitionKey: { name: "code", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.eventsTable = new Table(
      scope,
      `${props.stackName}-EventsTable-${props.stage}`,
      {
        partitionKey: { name: "eventID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.eventsTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
    this.eventsTable.addGlobalSecondaryIndex({
      indexName: "byProfileIDPlanType",
      partitionKey: { name: "profileID#PlanType", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.eventsPaymentsTable = new Table(
      scope,
      `${props.stackName}-EventsPaymentsTable-${props.stage}`,
      {
        partitionKey: { name: "paymentID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.eventsPaymentsTable.addGlobalSecondaryIndex({
      indexName: "byEventID",
      partitionKey: { name: "eventID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
    this.eventsPaymentsTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.subscriptionsPaymentsTable = new Table(
      scope,
      `${props.stackName}-SubscriptionsPaymentsTable-${props.stage}`,
      {
        partitionKey: { name: "subscriptionID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.subscriptionsPaymentsTable.addGlobalSecondaryIndex({
      indexName: "byEventID",
      partitionKey: { name: "eventID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
    this.subscriptionsPaymentsTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.surveysTable = new Table(
      scope,
      `${props.stackName}-SurveysTable-${props.stage}`,
      {
        partitionKey: { name: "surveyID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.surveysTable.addGlobalSecondaryIndex({
      indexName: "byEventID",
      partitionKey: { name: "eventID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
    this.surveysTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
