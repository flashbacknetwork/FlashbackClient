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
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { describe, jest, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import http from 'http';

import dotenv from 'dotenv';

dotenv.config(); // loads the .env file

describe('StorageClient', () => {
  jest.setTimeout(600000);

  const testConfigurations = [
    {
      name: 'S3 to S3 StorJ Configuration (AWS endpoint)',
      config: {
        endpoint: process.env.TEST_S3_AWS_PROVIDER_URL,
        //endpoint: process.env.TEST_AWS_LOCAL_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET_STORJ!,
    },
    {
      name: 'S3 to GCS Configuration (AWS endpoint)',
      config: {
        endpoint: process.env.TEST_S3_AWS_PROVIDER_URL2,
        //endpoint: process.env.TEST_AWS_LOCAL_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET2!,
    },
    {
      name: 'S3 to Azure Configuration',
      config: {
        endpoint: process.env.TEST_S3_AWS_PROVIDER_URL3!,
        //endpoint: process.env.TEST_AWS_LOCAL_PROVIDER_URL!,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AZURE_CONTAINER_NAME!,
    },
    /*
    {
      name: 'S3 to delegated S3 (AWS endpoint)',
      config: {
        //endpoint: process.env.TEST_S3_AWS_PROVIDER_URL,
        endpoint: process.env.TEST_AWS_LOCAL_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET4!,
    },
    {
      name: 'S3 to delegated GCS (AWS endpoint)',
      config: {
        //endpoint: process.env.TEST_S3_AWS_PROVIDER_URL,
        endpoint: process.env.TEST_AWS_LOCAL_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_GCS_BUCKET2!,
    },
    */
    /*
    {
      name: 'S3 to S3 Configuration (GCP endpoint)',
      config: {
        endpoint: process.env.TEST_S3_GCP_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET4!,
    },
    {
      name: 'S3 to GCS Configuration (GCP endpoint)',
      config: {
        endpoint: process.env.TEST_S3_GCP_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET2!,
    },
    {
      name: 'S3 to Delegated S3 Configuration (GCP endpoint)',
      config: {
        endpoint: process.env.TEST_S3_GCP_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET4!,
    },
    {
      name: 'S3 to delegated GCS (GCP endpoint)',
      config: {
        endpoint: process.env.TEST_S3_GCP_PROVIDER_URL,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.TEST_AWS_REGION,
        forcePathStyle: false,
      },
      bucketName: process.env.TEST_GCS_BUCKET2!,
    },
    */
    /*
    {
      name: 'Direct S3 Connect',
      config: {
        endpoint: process.env.TEST_AWS_PROVIDER_URL_STORJ,
        credentials: {
          accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID_STORJ!,
          secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_STORJ!,
        },
        region: "",
        forcePathStyle: true,
      },
      bucketName: process.env.TEST_AWS_S3_BUCKET_STORJ!,
    }
      */
  ];

  const testFolderName = 'flashback';
  const testFileName = 'sample.jpg';
  const testFileName2 = 'sample2.jpg';
  const testFilePath = path.join('tests', testFileName);

  test.each(testConfigurations)(
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

      // 2. Upload File
      try {
        // Create a new stream for each attempt
        const uploadStream = fs.createReadStream(testFilePath);

        // Add error handler to the stream
        uploadStream.on('error', (err) => {
          console.error('Stream error:', err);
        });

        const uploadResponse = await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: uploadStream,
            ContentType: 'image/jpeg',
          })
        );
        expect(uploadResponse.$metadata.httpStatusCode).toBe(200);
      } catch (error) {
        console.error('Error uploading file:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw error; // Re-throw to fail the test
      }

      // 3. List Bucket Contents
      try {
        const listResponse = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: 'flashback/',
          })
        );
        expect(listResponse.Contents?.length).toBeGreaterThan(0);
      } catch (error) {
        console.error('Error listing bucket contents:', error);
      }

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

      // 5b. Copy file into same bucket
      try {
        const copyResponse = await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            Key: key2,
            CopySource: `${bucketName}/${key}`,
          })
        );
        expect(copyResponse.$metadata.httpStatusCode).toBe(200);
      } catch (error) {
        console.error('Error copying file:', error);
      }

      // 6. Delete File
      const deleteResponse = await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );

      // 6b. Delete File
      const deleteResponse2 = await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key2,
        })
      );

      // 7. Upload file using presigned url
      try {
        const presignedUrlForUpload = await getSignedUrl(
          s3Client,
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
          {
            expiresIn: 3600,
          }
        );

        const uploadStream = fs.createReadStream(testFilePath);
        const uploadResponseFromPresignedUrl = await fetch(presignedUrlForUpload, {
          method: 'PUT',
          body: uploadStream,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': fileStats.size.toString(),
          },
        });
        expect(uploadResponseFromPresignedUrl.status).toBe(200);
      } catch (error) {
        console.error('Error uploading file using presigned url:', error);
      }

      // 7b. download file using presigned url
      try {
        const presignedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
          {
            expiresIn: 3600,
          }
        );
        const downloadResponseFromPresignedUrl = await fetch(presignedUrl, {
          agent: new http.Agent({
            keepAlive: true,
            timeout: 30000,
          }),
        });
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
        const presignedUrlForDelete = await getSignedUrl(
          s3Client,
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
          {
            expiresIn: 3600,
          }
        );
        const deleteResponseFromPresignedUrl = await fetch(presignedUrlForDelete, {
          method: 'DELETE',
        });
        expect(deleteResponseFromPresignedUrl.status).toBe(204);
      } catch (error) {
        console.error('Error deleting file using presigned url:', error);
      }

      const testBigFileName = 'samplelonglt100mb.dmg';
      const testBigFilePath = path.join('tests', testBigFileName);
      const testBigFileStats = fs.statSync(testBigFilePath);
      const testBigFileStream = fs.createReadStream(testBigFilePath);

      // Test multipart upload for large file
      const bigKey = `${testFolderName}/${testBigFileName}`;
      let uploadId: string | undefined;
      const partSize = 10 * 1024 * 1024; // 5MB chunks
      const parts: { ETag: string; PartNumber: number }[] = [];

      try {
        // 1. Initiate multipart upload
        try {
          console.log('Initiating multipart upload...');
          const createMultipartUploadResponse = await s3Client.send(
            new CreateMultipartUploadCommand({
              Bucket: bucketName,
              Key: bigKey,
              ContentType: 'application/octet-stream',
            })
          );
          uploadId = createMultipartUploadResponse.UploadId!;
          expect(uploadId).toBeDefined();
          console.log('Multipart upload initiated successfully');
        } catch (error) {
          console.error('Error initiating multipart upload:', error);
          throw error;
        }

        // 2. Upload parts
        try {
          console.log('Starting parts upload...');
          let partNumber = 1;
          let buffer = Buffer.alloc(0);

          for await (const chunk of testBigFileStream) {
            buffer = Buffer.concat([buffer, chunk]);

            if (buffer.length >= partSize) {
              console.log(`Uploading part ${partNumber}...`);
              const uploadPartResponse = await s3Client.send(
                new UploadPartCommand({
                  Bucket: bucketName,
                  Key: bigKey,
                  UploadId: uploadId,
                  PartNumber: partNumber,
                  Body: buffer,
                })
              );

              parts.push({
                ETag: uploadPartResponse.ETag!,
                PartNumber: partNumber,
              });

              buffer = Buffer.alloc(0);
              partNumber++;
              console.log(`Part ${partNumber - 1} uploaded successfully`);

              // if part number is 6, test the ListParts command
              if (partNumber === 6) {
                const listPartsResponse = await s3Client.send(
                  new ListPartsCommand({
                    Bucket: bucketName,
                    Key: bigKey,
                    UploadId: uploadId,
                  })
                );
                console.log('ListParts response:', listPartsResponse);
                expect(listPartsResponse.Parts?.length).toBe(parts.length);
              }
            }
          }
          // Upload remaining buffer if any
          if (buffer.length > 0) {
            console.log(`Uploading final part ${partNumber}...`);
            const uploadPartResponse = await s3Client.send(
              new UploadPartCommand({
                Bucket: bucketName,
                Key: bigKey,
                UploadId: uploadId,
                PartNumber: partNumber,
                Body: buffer,
              })
            );

            parts.push({
              ETag: uploadPartResponse.ETag!,
              PartNumber: partNumber,
            });
            console.log(`Final part ${partNumber} uploaded successfully`);
          }
          console.log('All parts uploaded successfully');
        } catch (error) {
          console.error('Error uploading parts:', error);
          throw error;
        }

        // 3. Complete multipart upload
        try {
          console.log('Completing multipart upload...');
          const completeResponse = await s3Client.send(
            new CompleteMultipartUploadCommand({
              Bucket: bucketName,
              Key: bigKey,
              UploadId: uploadId,
              MultipartUpload: { Parts: parts },
            })
          );
          expect(completeResponse.$metadata.httpStatusCode).toBe(200);
          console.log('Multipart upload completed successfully');
        } catch (error) {
          console.error('Error completing multipart upload:', error);
          throw error;
        }

        // 4. Verify the upload by downloading
        try {
          console.log('Verifying upload by downloading...');
          const downloadResponse = await s3Client.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: bigKey,
            })
          );

          if (downloadResponse.Body instanceof Readable) {
            const chunks: Buffer[] = [];
            for await (const chunk of downloadResponse.Body) {
              chunks.push(Buffer.from(chunk));
            }
            const downloadedContent = Buffer.concat(chunks);
            expect(downloadedContent.length).toBe(testBigFileStats.size);
            console.log('Download verification successful');
          }
        } catch (error) {
          console.error('Error verifying upload:', error);
          throw error;
        }

        // 5. Delete the large file
        try {
          console.log('Deleting uploaded file...');
          const deleteResponse = await s3Client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: bigKey,
            })
          );
          expect(deleteResponse.$metadata.httpStatusCode).toBe(204);
          console.log('File deleted successfully');
        } catch (error) {
          console.error('Error deleting file:', error);
          throw error;
        }
      } catch (error) {
        // If anything fails, try to abort the multipart upload
        if (uploadId) {
          try {
            console.log('Attempting to abort multipart upload...');
            await s3Client.send(
              new AbortMultipartUploadCommand({
                Bucket: bucketName,
                Key: bigKey,
                UploadId: uploadId,
              })
            );
            console.log('Multipart upload aborted successfully');
          } catch (abortError) {
            console.error('Error aborting multipart upload:', abortError);
          }
        }
        console.error('Error in multipart upload test:', error);
        throw error;
      }
    }
  );
});
