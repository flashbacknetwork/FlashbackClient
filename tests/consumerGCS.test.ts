/* eslint-disable no-undef */
import { Storage } from '@google-cloud/storage';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
import { FlashbackGCSStorage, SignedUrlOptions } from '../src/gcs/storage';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const testConfigurations = [
    {
      name: 'GCS to S3 Configuration',
      config: {
        apiEndpoint: process.env.TEST_PROVIDER_URL,
        credentials: {
          client_email: process.env.TEST_GCS_CLIENT_EMAIL!,
          private_key: process.env.TEST_GCS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        },
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET!,
    },
    /*
    {
      name: 'GCS to GCS Configuration',
      config: {
        apiEndpoint: process.env.TEST_PROVIDER_URL,
        credentials: {
          client_email: process.env.TEST_GCS_CLIENT_EMAIL2!,
          private_key: process.env.TEST_GCS_PRIVATE_KEY2!.replace(/\\n/g, '\n'),
        },
      },
      bucketName: process.env.TEST_GCS_BUCKET2!,
    },
    */
  ];

  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const filePath = `${testFolderName}/${testFileName}`;
  const testFilePath = path.join('tests', testFileName);

  test.each(testConfigurations)('Should perform complete GCS operations workflow for $name', async ({ config, bucketName }) => {
    const storage = new FlashbackGCSStorage(config);
    const fileStats = fs.statSync(testFilePath);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // 1. Check if bucket exists
    try {
      const [exists] = await storage.bucket(bucketName).exists();
      expect(exists).toBe(true);
    } catch (error) {
      console.error('Error checking bucket existence:', error);
      throw error;
    }

    // 2. Upload File
    try {
      const uploadResponse = await bucket.upload(testFilePath, {
        destination: filePath,
        contentType: 'image/jpeg',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    // 3. List Bucket Contents
    try {
      const [files] = await bucket.getFiles({
        prefix: 'flashback/',
        delimiter: '/',
      });
      expect(files.length).not.toEqual(0);
      //expect(files[0].name).toEqual(filePath);
    } catch (error) {
      console.error('Error listing bucket contents:', error);
      throw error;
    }

    // 4. Get File Metadata
    try {
      const [metadata] = await file.getMetadata();
      expect(metadata.size).toEqual(fileStats.size);
      expect(metadata.content_type).toEqual('image/jpeg');
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }

    // 5. Download File using streams
    try {
      const downloadStream = file.createReadStream();
      const chunks: Buffer[] = [];

      await new Promise((resolve, reject) => {
        downloadStream
          .on('data', (chunk: Buffer) => chunks.push(chunk))
          .on('error', reject)
          .on('end', resolve);
      });

      const downloadedData = Buffer.concat(chunks);
      expect(downloadedData.length).toBe(fileStats.size);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }

    // 6. Delete File
    try {
      await file.delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }

    // 7. Upload through signed url
    try {
      const file = bucket.file(filePath);

      const optionsWrite: SignedUrlOptions = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'image/jpeg', // strongly recommended if you want to enforce content-type
        file
      };

      const [signedUrl] = await storage.getSignedUrl(optionsWrite);
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: fs.createReadStream(testFilePath),
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
    } catch (error) {
      console.error('Error uploading file through signed url:', error);
    }

    try {
      const file = bucket.file(filePath);

      const options: SignedUrlOptions = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'image/jpeg', // strongly recommended if you want to enforce content-type
        file
      };
      const [signedUrl] = await storage.getSignedUrl(options);
      const downloadResponse = await fetch(signedUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
      expect(downloadResponse.status).toBe(200);
      const downloadData = await downloadResponse.arrayBuffer();
      expect(downloadData.byteLength).toBe(fileStats.size);
    } catch (error) {
      console.error('Error downloading file through signed url:', error);
    }

    try {
      const file = bucket.file(filePath);

      const optionsDelete: SignedUrlOptions = {
        version: 'v4',
        action: 'delete',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'image/jpeg', // strongly recommended if you want to enforce content-type
        file
      };

      const [signedUrl] = await storage.getSignedUrl(optionsDelete);
      const deleteResponse = await fetch(signedUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
      expect(deleteResponse.status).toBe(204);
    } catch (error) {
      console.error('Error deleting file through signed url:', error);
    }
    storage.cleanup();
  });
});
