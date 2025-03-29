import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

import dotenv from 'dotenv';
dotenv.config(); // loads the .env file

async function getTemporaryCredentials() {
  try {
    const stsClient = new STSClient({
      region: process.env.TEST_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.TEST_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.TEST_AWS_SECRET_ACCESS_KEY!,
      },
    });
    const command = new AssumeRoleCommand({
      RoleArn: process.env.TEST_ROLE_ARN!,
      RoleSessionName: "MonitoringSession",
      ExternalId: process.env.TEST_EXTERNAL_ID!,
      DurationSeconds: 3600,
    });

    const response = await stsClient.send(command);
    return response.Credentials;
  }
  catch(error) {
      console.log(error)
  }
}

describe('StorageClient', () => {
  jest.setTimeout(60000);
  let s3Client: S3Client;

  beforeAll(async () => {
    const creds = await getTemporaryCredentials();
    s3Client = new S3Client({
      region: process.env.TEST_AWS_REGION,
      credentials: {
        accessKeyId: creds!.AccessKeyId!,
        secretAccessKey: creds!.SecretAccessKey!,
        sessionToken: creds!.SessionToken!,
      },
    });
  });

  test('Should perform complete S3 operations workflow', async () => {
    const bucketName = process.env.TEST_AWS_S3_BUCKET;
    const command = new ListObjectsV2Command({ Bucket: bucketName });

    try {
      const response = await s3Client.send(command);
      console.log("Bucket Objects:", response.Contents);
    } catch (error) {
      console.error("Error listing bucket:", error);
    }
  });
});

