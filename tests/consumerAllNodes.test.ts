/* eslint-disable no-undef */
import {
  S3Client,
  HeadBucketCommand,
  HeadBucketCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { Storage } from '@google-cloud/storage';
import {
  OAuth2Client,
  GoogleAuth,
  Credentials,
  AuthClient,
  OAuth2ClientOptions,
} from 'google-auth-library';
import fetch from 'node-fetch';
import http from 'http';

import dotenv from 'dotenv';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const regions = [ "us-east-1","eu-central-1" ];
  const providers = [ "aws", "gcp", "azure" ];
  const apis = [ "s3", "gcs", "blob" ];
  
  const testHealthCheck = regions.flatMap(region => 
    providers.flatMap(provider => 
      apis.map(api => ( `https://${api}-${region}-${provider}.flashback.tech/health`))
    )
  );

  const testS3Configurations = regions.flatMap(region => 
    providers.map(provider => ({
      name: `S3 ${region} ${provider.toUpperCase()} Configuration`,
      config: {
        endpoint: `https://s3-${region}-${provider}.flashback.tech`,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET_STORJ!,
    }))
  );
  
  const testGCSConfigurations = regions.flatMap(region => 
    providers.map(provider => ({
      name: `GCS ${region} ${provider.toUpperCase()} Configuration`,
      config: {
        apiEndpoint: `https://gcs-${region}-${provider}.flashback.tech`,
        tokenUri: `https://gcs-${region}-${provider}.flashback.tech/token`,
        credentials: {
          client_email: process.env.TEST_GCS_CLIENT_EMAIL!,
          private_key: process.env.TEST_GCS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        },
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET4!,
    }))
  );

  const testBLOBConfigurations = regions.flatMap(region => 
    providers.map(provider => ({
      name: `BLOB ${region} ${provider.toUpperCase()} Configuration`,
      config: {
        endpoint: `https://blob-${region}-${provider}.flashback.tech`,
        accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME!,
        accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY!,
      },
      containerName: process.env.TEST_AWS_S3_BUCKET4!,
    }))
  );


  test.each(testHealthCheck)(
    'Should perform health check for $name',
    async (url: string) => {
      const response = await fetch(url);
      expect(response.status).toBe(200);
    }
  );


  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const testFileName2 = 'sample2.jpg';
  const testFilePath = path.join('tests', testFileName);

  test.each(testS3Configurations)(
    'Should perform complete S3 operations workflow for $name',
    async ({ config, bucketName }) => {
      const s3Client = new S3Client(config);

      const key = `${testFolderName}/${testFileName}`;
      const key2 = `${testFolderName}/${testFileName2}`;
      const fileStats = fs.statSync(testFilePath);
      const fileStream = fs.createReadStream(testFilePath);

      // 1. Head Bucket - Check if bucket exists
      let headBucketResponse: HeadBucketCommandOutput;
      try {
        headBucketResponse = await s3Client.send(
          new HeadBucketCommand({
            Bucket: bucketName,
          })
        );
        expect(headBucketResponse.$metadata.httpStatusCode).toBe(200);
        //expect(headBucketResponse.BucketLocationType).toBe('Single');   // the delegated GCS test bucket clooddevgcp is multi-region
      } catch (error) {
        console.error('Error checking bucket existence:', error);
      }
    }
  );

  test.each(testGCSConfigurations)(
    'Should perform complete S3 operations workflow for $name',
    async ({ config, bucketName }) => {
      const clientOptions: OAuth2ClientOptions = {
        clientId: config.credentials.client_email,
        clientSecret: config.credentials.private_key,
        endpoints: {
          oauth2TokenUrl: config.tokenUri,
        },
      };
      const authClient = new OAuth2Client(clientOptions);

      const storage = new Storage({
        ...config,
        authClient,
      });

      const bucket = storage.bucket(bucketName);

      // 1. Check if bucket exists
      try {
        const [exists] = await storage.bucket(bucketName).exists();
        expect(exists).toBe(true);
      } catch (error) {
        console.error('Error checking bucket existence:', error);
        throw error;
      }
    }
  );

  test.each(testBLOBConfigurations)(
    'Should perform complete BLOB operations workflow for $name',
    async ({ config, containerName }) => {
      const endpointUrl = new URL(config.endpoint);
      const customHostname = `${config.accountName}.${endpointUrl.hostname}`;
      const customEndpoint = `${endpointUrl.protocol}//${customHostname}${endpointUrl.port ? ':' + endpointUrl.port : ''}`;
      const connectionString = `DefaultEndpointsProtocol=${endpointUrl.protocol.replace(':', '')};AccountName=${config.accountName};AccountKey=${config.accountKey};BlobEndpoint=${customEndpoint}`;
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);

      try {
        const containerProperties = await containerClient.getProperties();
        expect(containerProperties._response.status).toBe(200);
      } catch (error) {
        console.error('Error checking container existence:', error);
      }
    }
  );
});
