import { Storage, StorageOptions } from '@google-cloud/storage';
import { FlashbackAuthClient, MockupAuthClient } from './oauth2';

export interface ServiceCredentials {
    client_email: string;
    private_key: string;
}

export interface FlashbackStorageOptions extends Omit<StorageOptions, 'authClient'> {
  apiEndpoint?: string;
  tokenScopes?: string[];
  credentials: ServiceCredentials;
}

export class FlashbackGCSStorage extends Storage {
  constructor(opts: FlashbackStorageOptions) {
    const {
      credentials,
      apiEndpoint = 'https://gcs.us-east-1.flashback.tech',
      tokenScopes = ['READ', 'WRITE'],
      ...rest
    } = opts;

    const authClient = new FlashbackAuthClient(apiEndpoint + '/token', tokenScopes, credentials!);

    // Intercept Gaxios instance creation
    const originalRequest = require('gaxios').instance.request;
    require('gaxios').instance.request = async function(opts: any) {
      // Add auth headers to all requests
      const headers = await authClient.getRequestHeaders();
      opts.headers = {
        ...(opts.headers || {}),
        ...headers,
      };
      return originalRequest.call(this, opts);
    };

    super({
      ...rest,
      apiEndpoint,
      authClient,
      useAuthWithCustomEndpoint: true,
      retryOptions: {
        autoRetry: true,
        maxRetries: 3,
      },
    });

  }
}

