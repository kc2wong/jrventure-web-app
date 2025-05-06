// lib/web-app-stack.ts
import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

export class LinkedupWebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webAppBucket = new Bucket(this, 'LinkedupWebAppBucket', {
      bucketName: 'linkedup-web-app-bucket', // <-- optional: customize your bucket name
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // fallback for React Router
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // ⚡ allow public access (required for static hosting)
    });

    const _webAppMediaBucket = new Bucket(this, 'LinkedupWebAppMediaBucket', {
      bucketName: 'linkedup-web-app-media-bucket', // <-- optional: customize your bucket name
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // ⚡ allow public access (required for static hosting)
    });

    // Deploy only index.html separately (no cache)
    new BucketDeployment(this, 'DeployLinkedupWebAppIndexHtml', {
      sources: [Source.asset(path.resolve(__dirname, '..', 'dist', 'noncached-files'))],
      destinationBucket: webAppBucket,
      cacheControl: [CacheControl.noCache(), CacheControl.noStore(), CacheControl.mustRevalidate()],
      retainOnDelete: false,
      prune: false, // don't prune other files
    });

    // Deploy cached assets directory
    new BucketDeployment(this, 'DeployLinkedupWebApp', {
      sources: [Source.asset(path.resolve(__dirname, '..', 'dist', 'cached-files'))],
      destinationBucket: webAppBucket,
      cacheControl: [CacheControl.maxAge(Duration.days(365))], // default long cache
      retainOnDelete: false,
      prune: false,
    });

    // 4. Output the website URL
    new CfnOutput(this, 'LinkedupWebAppUrl', {
      value: webAppBucket.bucketWebsiteUrl,
    });
  }
}
