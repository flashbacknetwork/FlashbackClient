/// <reference types="node" />
import {
  S3Client,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('AWS S3 Operations', () => {
  jest.setTimeout(10000);

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
  const testFileName = 'sample.jpg';
  const testFilePath = path.join(__dirname, 'tests', testFileName);

  test('Should perform complete S3 operations workflow', async () => {
    // 1. Head Bucket - Check if bucket exists
    await expect(async () => {
      await s3Client.send(
        new HeadBucketCommand({
          Bucket: bucketName,
        })
      );
    }).resolves.not.toThrow();

    // 2. List Bucket Contents
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    expect(listResponse.Contents).toBeDefined();

    // 3. Upload File
    const fileContent = fs.readFileSync(testFilePath);
    const uploadResponse = await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testFileName,
        Body: fileContent,
        ContentType: 'image/jpeg',
      })
    );
    expect(uploadResponse.$metadata.httpStatusCode).toBe(200);

    // 4. Head Object - Get object metadata
    const headResponse = await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: testFileName,
      })
    );
    expect(headResponse.ContentType).toBe('image/jpeg');
    expect(headResponse.ContentLength).toBe(fileContent.length);

    // 5. Download File
    const downloadResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: testFileName,
      })
    );

    if (downloadResponse.Body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.Body) {
        chunks.push(Buffer.from(chunk));
      }
      const downloadedContent = Buffer.concat(chunks);
      expect(downloadedContent.length).toBe(fileContent.length);
      expect(downloadedContent).toEqual(fileContent);
    }

    // 6. Delete File
    const deleteResponse = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testFileName,
      })
    );
    expect(deleteResponse.$metadata.httpStatusCode).toBe(204);
  });
});
