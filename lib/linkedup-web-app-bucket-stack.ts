import * as path from 'path';

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class LinkedupWebAppBucketStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, {
      ...props,
    });

    const webAppBucket = new Bucket(this, 'JrventureWebAppBucket', {
      bucketName: 'jr-venture-web-app-bucket',
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    });

    new CfnOutput(this, 'JrventureWebAppBucketNameOutput', {
      value: webAppBucket.bucketName,
      exportName: 'JrventureWebAppBucketName',
    });

    new BucketDeployment(this, 'JrventureWebAppDeployment', {
      sources: [Source.asset(path.join(__dirname, '..', 'dist'))],
      // destinationBucket: this.websiteBucket,
      destinationBucket: webAppBucket,
    });
  }
}
