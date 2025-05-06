import * as cdk from 'aws-cdk-lib';
import { LinkedupWebAppStack } from '../lib/linkedup-web-app-stack';

const app = new cdk.App();
new LinkedupWebAppStack(app, 'LinkedupWebAppStack');
