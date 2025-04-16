/* eslint-disable no-undef */
import {
  S3Client,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import fetch from 'node-fetch';

import dotenv from 'dotenv';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const testConfigurations = [
    /*
    {
      name: 'S3 to S3 Configuration',
      config: {
        endpoint: process.env.TEST_AWS_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: true,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET!,
    },
    {
      name: 'S3 to GCS Configuration',
      config: {
        endpoint: process.env.TEST_AWS_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID2!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY2!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET2!,
    },
    */
    {
      name: 'Direct S3 Connect',
      config: {
        endpoint: process.env.TEST_AWS_PROVIDER_URL3,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID3!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY3!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: true,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET3!,
    }
  ];

  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const testFilePath = path.join('tests', testFileName);

  test.each(testConfigurations)('Should perform complete S3 operations workflow for $name', async ({ config, bucketName }) => {
    const s3Client = new S3Client(config);
    const key = `${testFolderName}/${testFileName}`;

    // 1. Head Bucket - Check if bucket exists
    let headBucketResponse: HeadBucketCommandOutput;
    try {
      headBucketResponse = await s3Client.send(
        new HeadBucketCommand({
          Bucket: bucketName,
        })
      );
      expect(headBucketResponse.$metadata.httpStatusCode).toBe(200);
      expect(headBucketResponse.BucketLocationType).toBe('Single');
    } catch (error) {
      console.error('Error checking bucket existence:', error);
    }
    const fileStats = fs.statSync(testFilePath);

    // 2. Upload File
    const fileStream = fs.createReadStream(testFilePath);
    try {
      const uploadResponse = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileStream,
          ContentType: 'image/jpeg',
        })
      );
      expect(uploadResponse.$metadata.httpStatusCode).toBe(200);
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    // 3. List Bucket Contents
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'flashback/',
      })
    );
    expect(listResponse.Contents?.length).toBeGreaterThan(0);

    // 4. Head Object - Get object metadata
    const headResponse = await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    expect(headResponse.$metadata.httpStatusCode).toBe(200);
    expect(headResponse.ContentLength).toBe(fileStats.size);

    // 5. Download File
    const downloadResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (downloadResponse.Body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.Body) {
        chunks.push(Buffer.from(chunk));
      }
      const downloadedContent = Buffer.concat(chunks);
      expect(downloadedContent.length).toBe(fileStats.size);
    }

    // 6. Delete File
    const deleteResponse = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    // 7. Upload file using presigned url
    try {
      const presignedUrlForUpload = await getSignedUrl(s3Client, new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      }), {
        expiresIn: 3600,
      });
      
      const uploadStream = fs.createReadStream(testFilePath);
      const uploadResponseFromPresignedUrl = await fetch(presignedUrlForUpload, {
        method: 'PUT',
        body: uploadStream,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': fileStats.size.toString()
        }
      });
      expect(uploadResponseFromPresignedUrl.status).toBe(200);
    } catch (error) {
      console.error('Error uploading file using presigned url:', error);
    }

    // 7b. download file using presigned url
    try {
      const presignedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }), {
        expiresIn: 3600,
      });
      const downloadResponseFromPresignedUrl = await fetch(presignedUrl);
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponseFromPresignedUrl.body) {
        chunks.push(Buffer.from(chunk as Uint8Array));
      }
      const downloadedContentFromPresignedUrl = Buffer.concat(chunks);
      expect(downloadedContentFromPresignedUrl.length).toBe(fileStats.size);
    } catch (error) {
      console.error('Error downloading file using presigned url:', error);
    }

    // 8. Delete File (again) with signed url
    try {
      const presignedUrlForDelete = await getSignedUrl(s3Client, new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }), {
        expiresIn: 3600,
      });
      const deleteResponseFromPresignedUrl = await fetch(presignedUrlForDelete, {
        method: 'DELETE',
      });
      expect(deleteResponseFromPresignedUrl.status).toBe(204);
    } catch (error) {
      console.error('Error deleting file using presigned url:', error);
    }
  });
});
