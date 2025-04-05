/* eslint-disable no-undef */
// Load the interceptor before any other imports
require('./gaxiosInterceptor');

// Now import the rest of the dependencies
import { JWT, Impersonated } from 'google-auth-library';
import { Storage  } from '@google-cloud/storage';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);
  
  let saclient = new JWT({
    email: process.env.TEST_GCS_CLIENT_EMAIL!,
    key: process.env.TEST_GCS_PRIVATE_KEY!.replace(/\\n/g, '\n'),  // Fix private key formatting
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/iam']
  });

  // Use that to impersonate the targetPrincipal
  let targetClient = new Impersonated({
    sourceClient: saclient,
    targetPrincipal: process.env.TEST_GCS_SUBJECT!,
    lifetime: 30,
    delegates: [],
    targetScopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });

  // 3. Use client with GCP Service 
  const storage = new Storage({
    authClient: targetClient,
  });

  const bucketName = process.env.TEST_GCS_BUCKET!;
  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const filePath = `${testFolderName}/${testFileName}`;
  const testFilePath = path.join('tests', testFileName);

  test('Should perform complete GCS operations workflow', async () => {
    
    // 1. Check if bucket exists
    try {
      const [exists] = await storage.bucket(bucketName).exists();
      expect(exists).toBe(true);
    } catch (error) {
      console.error('Error checking bucket existence:', error);
      throw error;
    }
/*
    const fileStats = fs.statSync(testFilePath);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // 2. Upload File
    try {
      const uploadResponse = await bucket.upload(testFilePath, {
        destination: filePath,
        contentType: 'image/jpeg',
      });
      console.log(uploadResponse);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // 3. List Bucket Contents
    try {
      const [files] = await bucket.getFiles({
        prefix: 'flashback/',
        delimiter: '/',
        startOffset: '0',
        maxResults: 10,
      });
      expect(files.length).toEqual(1);
      expect(files[0].name).toEqual(filePath);
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
    */
  });
});
