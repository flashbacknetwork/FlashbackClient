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
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

import dotenv from 'dotenv';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const s3Client = new S3Client({
    endpoint: process.env.TEST_AWS_PROVIDER_URL,
    credentials: {
      accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.TEST_AWS_REGION,
    forcePathStyle: false, // This enables virtual host based addressing
  });

  const bucketName = process.env.TEST_AWS_S3_BUCKET!;
  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const key = `${testFolderName}/${testFileName}`;
  const testFilePath = path.join('tests', testFileName);

  test('Should perform complete S3 operations workflow', async () => {
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
    try {
      const fileStream = fs.createReadStream(testFilePath);
      //const fileStream = fs.readFileSync(testFilePath);
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
    //expect(listResponse.Contents?.[0].Key).toEqual(key);

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
      //expect(downloadedContent).toEqual(fileContent);
    }

    // 6. Delete File
    const deleteResponse = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    expect(deleteResponse.$metadata.httpStatusCode).toBe(204);
  });
});
