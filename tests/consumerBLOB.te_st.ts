/* eslint-disable no-undef */
import {
  BlobServiceClient,
  ContainerClient,
  BlobClient,
  BlockBlobClient,
  BlobDownloadResponseModel,
  BlobProperties,
  BlobItem,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import crypto from 'crypto';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const testConfigurations = [
    {
      name: 'Azure to AWS S3 Configuration',
      config: {
        endpoint: process.env.TEST_AZURE_ENDPOINT2!,
        //endpoint: process.env.TEST_AZURE_LOCAL_ENDPOINT!,
        accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME!,
        accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY!,
      },
      containerName: process.env.TEST_AWS_S3_BUCKET4!,
    },
    {
      name: 'Azure to GCS Configuration',
      config: {
        endpoint: process.env.TEST_AZURE_ENDPOINT_EU!,
        //endpoint: process.env.TEST_AZURE_LOCAL_ENDPOINT!,
        accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME!,
        accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY!,
      },
      containerName: process.env.TEST_AWS_S3_BUCKET2!,
    },
    {
      name: 'Azure to Azure Configuration',
      config: {
        endpoint: process.env.TEST_AZURE_ENDPOINT!,
        //endpoint: process.env.TEST_AZURE_LOCAL_ENDPOINT!,
        accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME!,
        accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY!,
      },
      containerName: process.env.TEST_AZURE_CONTAINER_NAME!,
    },
    /*
    {
      name: 'Direct Azure access',
      config: {
        endpoint: process.env.TEST_AZURE_DIRECT_ENDPOINT!,
        accountName: process.env.TEST_AZURE_DIRECT_ACCOUNT!,
        accountKey: process.env.TEST_AZURE_DIRECT_SECRET!,
      },
      containerName: 'flashcontainer',
    },
    */
  ];

  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const testFileName2 = 'sample2.jpg';
  const testFilePath = path.join('tests', testFileName);

  // Helper function to get the appropriate agent based on URL protocol
  function getAgentForUrl(url: string) {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:'
      ? new https.Agent({ keepAlive: true, timeout: 30000 })
      : new http.Agent({ keepAlive: true, timeout: 30000 });
  }

  async function basicTests(
    containerClient: ContainerClient,
    key: string,
    key2: string,
    fileStats: fs.Stats
  ) {
    // 1. Get Container Properties - Check if container exists
    try {
      const containerProperties = await containerClient.getProperties();
      expect(containerProperties._response.status).toBe(200);
    } catch (error) {
      console.error('Error checking container existence:', error);
    }

    // 2a. Upload small File with uploadData (single chunk)
    try {
      const blockBlobClient = containerClient.getBlockBlobClient(key2);
      const fileBuffer = fs.readFileSync(testFilePath);
      const uploadResponse = await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg',
        },
      });
      expect(uploadResponse._response.status).toBe(201);
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    // 2b. Upload small File with uploadStream
    try {
      const fileStream = fs.createReadStream(testFilePath);
      const blockBlobClient = containerClient.getBlockBlobClient(key);
      const uploadResponse = await blockBlobClient.uploadStream(
        fileStream,
        fileStats.size,
        4 * 1024 * 1024, // 4MB buffer size
        {
          blobHTTPHeaders: {
            blobContentType: 'image/jpeg',
          },
        }
      );
      expect(uploadResponse._response.status).toBe(201);
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    // 3. List Container Contents
    try {
      const blobs: BlobItem[] = [];
      for await (const blob of containerClient.listBlobsFlat({ prefix: 'flashback/' })) {
        blobs.push(blob);
      }
      expect(blobs.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error listing container contents:', error);
    }

    // 4. Get Blob Properties
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    const properties = await blockBlobClient.getProperties();
    expect(properties._response.status).toBe(200);
    expect(properties.contentLength).toBe(fileStats.size);
    // 5. Download File
    try {
      const downloadResponse = await blockBlobClient.download();
      const chunks: Buffer[] = [];
      if (downloadResponse.readableStreamBody) {
        for await (const chunk of downloadResponse.readableStreamBody) {
          chunks.push(Buffer.from(chunk as Uint8Array));
        }
      }
      const downloadedContent = Buffer.concat(chunks);
      expect(downloadedContent.length).toBe(fileStats.size);
    } catch (error) {
      console.error('Error downloading file:', error);
    }

    // 6a. Delete File
    try {
      const blockBlobClient2 = containerClient.getBlockBlobClient(key2);
      const deleteResponse2 = await blockBlobClient2.delete();
      expect(deleteResponse2._response.status).toBe(202);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // 5b. Copy file within same container
    const sourceBlobClient = containerClient.getBlobClient(key);
    const destBlobClient = containerClient.getBlobClient(key2);

    try {
      const copyResponse = await destBlobClient.beginCopyFromURL(sourceBlobClient.url);
      await copyResponse.pollUntilDone();
      const result = copyResponse.getResult();
      expect(result?._response.status).toBe(200);
    } catch (error) {
      console.error('Error copying file:', error);
    }

    // 6b. Delete File
    try {
      const deleteResponse = await blockBlobClient.delete();
      expect(deleteResponse._response.status).toBe(202);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // 7. Upload file using SAS URL
    try {
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse('racwd'),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      });

      const uploadStream = fs.createReadStream(testFilePath);
      const uploadResponseFromSasUrl = await fetch(sasUrl, {
        method: 'PUT',
        body: uploadStream,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': fileStats.size.toString(),
          'x-ms-blob-type': 'BlockBlob',
        },
      });
      expect(uploadResponseFromSasUrl.status).toBe(201);
    } catch (error) {
      console.error('Error uploading file using SAS URL:', error);
    }

    // 7b. Download file using SAS URL
    try {
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse('r'),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      });

      const downloadResponseFromSasUrl = await fetch(sasUrl, {
        method: 'GET',
        headers: {
          'x-ms-version': '2020-04-08',
          'x-ms-date': new Date().toUTCString(),
          'x-ms-client-request-id': crypto.randomUUID(),
          'User-Agent': 'azsdk-js-storageblob/12.17.0',
          Accept: '*/*',
        },
        agent: getAgentForUrl(sasUrl),
      });

      const chunks: Buffer[] = [];
      if (downloadResponseFromSasUrl.body) {
        for await (const chunk of downloadResponseFromSasUrl.body) {
          chunks.push(Buffer.from(chunk as Uint8Array));
        }
        const downloadedContentFromSasUrl = Buffer.concat(chunks);
        expect(downloadedContentFromSasUrl.length).toBe(fileStats.size);
      } else {
        throw new Error('No response body received');
      }
    } catch (error) {
      console.error('Error downloading file using SAS URL:', error);
    }

    // 8. Delete File using SAS URL
    try {
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse('d'),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      });

      // Original fetch attempt
      const deleteResponseFromSasUrl = await fetch(sasUrl, {
        method: 'DELETE',
        headers: {
          'x-ms-version': '2020-04-08',
          'x-ms-date': new Date().toUTCString(),
          'x-ms-client-request-id': crypto.randomUUID(),
          'User-Agent': 'azsdk-js-storageblob/12.17.0',
          Accept: '*/*',
        },
        agent: getAgentForUrl(sasUrl),
      });
      expect(deleteResponseFromSasUrl.status).toBe(202);
    } catch (error) {
      console.error('Error deleting file using SAS URL:', error);
    }
  }

  test.each(testConfigurations)(
    'Should perform complete Azure Blob Storage operations workflow for $name',
    async ({ config, containerName }) => {
      // Use StorageSharedKeyCredential directly with standard endpoint
      //const creds = new StorageSharedKeyCredential(config.accountName, config.accountKey);
      //const blobServiceClient = new BlobServiceClient(`https://${config.accountName}.blob.core.windows.net`, creds);
      const endpointUrl = new URL(config.endpoint);
      const customHostname = `${config.accountName}.${endpointUrl.hostname}`;
      const customEndpoint = `${endpointUrl.protocol}//${customHostname}${endpointUrl.port ? ':' + endpointUrl.port : ''}`;
      const connectionString = `DefaultEndpointsProtocol=${endpointUrl.protocol.replace(':', '')};AccountName=${config.accountName};AccountKey=${config.accountKey};BlobEndpoint=${customEndpoint}`;
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);

      const key = `${testFolderName}/${testFileName}`;
      const key2 = `${testFolderName}/${testFileName2}`;
      const fileStats = fs.statSync(testFilePath);

      await basicTests(containerClient, key, key2, fileStats);

      const blockSize = 10 * 1024 * 1024; // 10MB blocks
      const testBigFileName = 'samplelonglt100mb.dmg';
      const testBigFilePath = path.join('tests', testBigFileName);
      const testBigFileStats = fs.statSync(testBigFilePath);
      const stream = fs.createReadStream(testBigFilePath, { highWaterMark: blockSize });
      const bigKey = `${testFolderName}/${testBigFileName}`;
      const bigBlockBlobClient = containerClient.getBlockBlobClient(bigKey);

      const blockIds: string[] = [];
      let blockIndex = 0;
      try {
        // Upload large file using block upload
        for await (const chunk of stream) {
          const blockId = Buffer.from(String(blockIndex).padStart(6, '0')).toString('base64');
          console.log(`Uploading block #${blockIndex} (${chunk.length} bytes)...`);

          // Ensure chunk is a Buffer
          const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          await bigBlockBlobClient.stageBlock(blockId, chunkBuffer, chunkBuffer.length);
          blockIds.push(blockId);

          blockIndex++;
        }
      } catch (error) {
        console.error('Error in block upload test:', error);
        throw error;
      }

      // Commit the block list
      try {
        console.log('Committing block list...');
        const commitResponse = await bigBlockBlobClient.commitBlockList(blockIds, {
          blobHTTPHeaders: {
            blobContentType: 'application/octet-stream',
          },
        });
        expect(commitResponse._response.status).toBe(201);
        console.log('Block upload completed successfully');
      } catch (error) {
        console.error('Error in block commit test:', error);
        throw error;
      }

      // Verify the upload by downloading
      try {
        console.log('Verifying upload by downloading...');
        const downloadResponse = await bigBlockBlobClient.download();
        const chunks: Buffer[] = [];
        if (downloadResponse.readableStreamBody) {
          for await (const chunk of downloadResponse.readableStreamBody) {
            chunks.push(Buffer.from(chunk as Uint8Array));
          }
        }
        const downloadedContent = Buffer.concat(chunks);
        expect(downloadedContent.length).toBe(testBigFileStats.size);
        console.log('Download verification successful');
      } catch (error) {
        console.error('Error in block download test:', error);
        throw error;
      }

      // Delete the large file
      try {
        console.log('Deleting uploaded file...');
        const deleteResponse = await bigBlockBlobClient.delete();
        expect(deleteResponse._response.status).toBe(202);
        console.log('File deleted successfully');
      } catch (error) {
        console.error('Error in block delete test:', error);
        throw error;
      }
    }
  );
});
