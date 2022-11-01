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
  public readonly mercadoPagoClientsTable: Table;
  public readonly paymentsTable: Table;
  public readonly subscriptionsTable: Table;
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

    this.mercadoPagoClientsTable = new Table(
      scope,
      `${props.stackName}-MercadoPagoClientsTable-${props.stage}`,
      {
        partitionKey: { name: "clientID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.mercadoPagoClientsTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.paymentsTable = new Table(
      scope,
      `${props.stackName}-PaymentsTable-${props.stage}`,
      {
        partitionKey: { name: "paymentID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.paymentsTable.addGlobalSecondaryIndex({
      indexName: "byEventID",
      partitionKey: { name: "eventID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
    this.paymentsTable.addGlobalSecondaryIndex({
      indexName: "byProfileID",
      partitionKey: { name: "profileID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.subscriptionsTable = new Table(
      scope,
      `${props.stackName}-SubscriptionsTable-${props.stage}`,
      {
        partitionKey: { name: "subscriptionID", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.subscriptionsTable.addGlobalSecondaryIndex({
      indexName: "byEventID",
      partitionKey: { name: "eventID", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
    this.subscriptionsTable.addGlobalSecondaryIndex({
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
