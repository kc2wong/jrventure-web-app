import * as cdk from 'aws-cdk-lib';

import { LinkedupWebAppBucketStack } from '../lib/linkedup-web-app-bucket-stack';

const app = new cdk.App();
new LinkedupWebAppBucketStack(app, 'LinkedupWebAppBucketStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});