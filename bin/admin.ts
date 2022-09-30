#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { AdminStack } from '../lib/admin-stack';

dotenv.config();

const STAGE = process.env.STAGE || 'dev';
const PROJECT = process.env.PROJECT || 'Touch Sistemas';
const MODULE = process.env.MODULE || 'Admin';
const SES_NOREPLY_EMAIL = process.env.SES_NOREPLY_EMAIL || '';

const app = new cdk.App();
new AdminStack(app, `${PROJECT}-${MODULE}-${STAGE}-Stack`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: `${PROJECT}-${MODULE}`,
  description: `${PROJECT} ${MODULE}`,
  tags: { project: PROJECT, stage: STAGE },
  stage: STAGE,
  ses_noreply_email: SES_NOREPLY_EMAIL,
});