/* eslint-disable no-undef */
import { DeleteParams, GetUrlParams, StorageClient, UploadRequest } from '../src/consumer/file';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  let client: StorageClient;

  jest.setTimeout(10000);

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a new client instance for each test
    client = new StorageClient({
      baseUrl: process.env.TEST_PROVIDER_URL || '',
      timeout: 30000,
    });
  });

  describe('Consumer client methods', () => {
    // Test structure for provider-related methods
    test('get file URL	', async () => {
      const urlParams: GetUrlParams = {
        folderId: 'flashback',
        fileId: 'file.txt',
      };
      const fileUrl = await client.getUrl(urlParams);
      expect(fileUrl).toBeDefined();
    });

    test('upload file', async () => {
      const fileParams: UploadRequest = {
        folderId: 'flashback',
        fileId: 'file.txt',
        data: Buffer.from('test file data').toString('base64'),
        type: 'base64',
      };
      const fileUrl = await client.upload(fileParams);
      expect(fileUrl.url).toBeDefined();
    });

    test('delete file', async () => {
      const deleteParams: DeleteParams = {
        folderId: 'flashback',
        fileId: 'file.txt',
      };
      let exceptionThrown = false;
      try {
        await client.delete(deleteParams);
      } catch (error) {
        console.error(error);
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(false);
    });
  });

  describe('Binary upload', () => {
    test('upload file', async () => {
      const fileParams: UploadRequest = {
        folderId: 'flashback',
        fileId: 'sample.jpg',
        data: readFileSync('tests/sample.jpg'),
        type: 'binary',
      };
      const fileUrl = await client.upload(fileParams);
      expect(fileUrl.url).toBeDefined();
    });

    test('delete file', async () => {
      const deleteParams: DeleteParams = {
        folderId: 'flashback',
        fileId: 'sample.jpg',
      };
      let exceptionThrown = false;
      try {
        await client.delete(deleteParams);
      } catch (error) {
        console.error(error);
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(false);
    });
  });

  describe('Form based upload', () => {
    test('delete file', async () => {
      const deleteParams: DeleteParams = {
        folderId: 'flashback',
        fileId: 'sample.jpg',
      };
      let exceptionThrown = false;
      try {
        await client.delete(deleteParams);
      } catch (error) {
        console.error(error);
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(false);
    });

    test('upload file as form data', async () => {
      const file = readFileSync('tests/sample.jpg');
      const blob = new Blob([file], { type: 'application/octet-stream' });
      const fileParams: UploadRequest = {
        folderId: 'flashback',
        fileId: 'sample.jpg',
        data: new File([blob], 'sample.jpg', { type: 'image/jpeg' }),
        type: 'multipart',
      };

      const fileUrl = await client.upload(fileParams);
      expect(fileUrl.url).toBeDefined();
    });

    test('delete file', async () => {
      const deleteParams: DeleteParams = {
        folderId: 'flashback',
        fileId: 'sample.jpg',
      };
      let exceptionThrown = false;
      try {
        await client.delete(deleteParams);
      } catch (error) {
        console.error(error);
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(false);
    });
  });
});
