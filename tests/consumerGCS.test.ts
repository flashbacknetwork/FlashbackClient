/* eslint-disable no-undef */
import { Storage } from '@google-cloud/storage';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

import dotenv from 'dotenv';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const storage = new Storage({
    apiEndpoint: process.env.TEST_PROVIDER_URL,
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

    const fileStats = fs.statSync(testFilePath);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // 2. Upload File
    try {
      await bucket.upload(testFilePath, {
        destination: filePath,
        metadata: {
          contentType: 'image/jpeg',
        },
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // 3. List Bucket Contents
    const [files] = await bucket.getFiles({
      prefix: 'flashback/',
    });
    expect(files.length).toEqual(1);
    expect(files[0].name).toEqual(filePath);

    // 4. Get File Metadata
    const [metadata] = await file.getMetadata();
    expect(metadata.size).toBe(String(fileStats.size));
    expect(metadata.contentType).toBe('image/jpeg');

    // 5. Download File using streams
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

    // 6. Delete File
    await file.delete();
    const [existsAfterDelete] = await file.exists();
    expect(existsAfterDelete).toBe(false);
  });
});
