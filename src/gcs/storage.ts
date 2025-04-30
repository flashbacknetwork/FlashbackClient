import { Storage, StorageOptions, File } from '@google-cloud/storage';

import { FlashbackAuthClient, MockupAuthClient } from './oauth2';
import crypto from 'crypto';

const originalRequest = require('gaxios').instance.request;

export interface ServiceCredentials {
    client_email: string;
    private_key: string;
}

export interface FlashbackStorageOptions extends Omit<StorageOptions, 'authClient'> {
  apiEndpoint?: string;
  tokenScopes?: string[];
  credentials: ServiceCredentials;
}

export interface SignedUrlOptions {
  version: 'v4';
  action: 'write' | 'read' | 'delete';
  expires: number;
  contentType: string;
  file: File;
}

export class FlashbackGCSStorage extends Storage {
  protected credentials: ServiceCredentials;
  private debug: boolean = false;

  constructor(opts: FlashbackStorageOptions) {
    const {
      credentials,
      apiEndpoint = 'https://gcs.us-east-1.flashback.tech',
      tokenScopes = ['READ', 'WRITE'],
      ...rest
    } = opts;

    const authClient = new FlashbackAuthClient(apiEndpoint + '/token', tokenScopes, credentials);
    
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

    this.credentials = credentials;

    // Intercept Gaxios instance creation
    require('gaxios').instance.request = async function(opts: any) {
      // Add auth headers to all requests
      const headers = await authClient.getRequestHeaders();
      opts.headers = {
        ...(opts.headers || {}),
        ...headers,
      };
      return originalRequest.call(this, opts);
    };
  }

  cleanup() {
    require('gaxios').instance.request = originalRequest;
  }

  // Override the bucket method to ensure we pass the auth client
  bucket(name: string) {
    return super.bucket(name);
  }

  setDebug(debug: boolean): void {
    this.debug = debug;
  }

  private doLog(...args: any[]): void {
    if (this.debug) {
      console.log(...args);
    }
  }

  // Override the getSignedUrl method
  async getSignedUrl(cfg: SignedUrlOptions): Promise<[string]> {
    const { version, action, expires, contentType } = cfg;
    const accessibleAt = new Date();
    const millisecondsToSeconds = 1.0 / 1000.0;
    const expiresPeriodInSeconds = Math.floor((expires - accessibleAt.valueOf()) * millisecondsToSeconds);
    
    this.doLog('Signing Parameters:', {
      action,
      expires,
      expiresPeriodInSeconds,
      accessibleAt: accessibleAt.toISOString(),
      contentType
    });

    if (expiresPeriodInSeconds > 604800) { // 7 days in seconds
      throw new Error('Max allowed expiration is seven days (604800 seconds).');
    }

    const extensionHeaders: Record<string, string> = {};
    extensionHeaders.host = new URL(this.apiEndpoint).hostname;
    if (contentType) {
      extensionHeaders['content-type'] = contentType;
    }

    const signedHeaders = Object.keys(extensionHeaders)
      .map(header => header.toLowerCase())
      .sort()
      .join(';');

    const canonicalHeaders = Object.entries(extensionHeaders)
      .map(([key, value]) => `${key.toLowerCase()}:${value}`)
      .join('\n') + '\n';

    const datestamp = accessibleAt.toISOString().split('T')[0];
    const credentialScope = `${datestamp}/auto/storage/goog4_request`;
    const credential = `${this.credentials.client_email}/${credentialScope}`;

    const dateISO = accessibleAt.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const queryParams = {
      'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
      'X-Goog-Credential': credential,
      'X-Goog-Date': dateISO,
      'X-Goog-Expires': expiresPeriodInSeconds.toString(),
      'X-Goog-SignedHeaders': signedHeaders,
    };

    const canonicalQueryString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    let method;
    switch (action) {
      case 'read':
        method = 'GET';
        break;
      case 'delete':
        method = 'DELETE';
        break;
      default:
        method = 'PUT';
        break;
    }

    const canonicalRequest = [
      method,
      `/${cfg.file.bucket.name}/${cfg.file.name}`,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    this.doLog('Canonical Request:', canonicalRequest);
    this.doLog('Canonical Request Hash:', crypto.createHash('sha256').update(canonicalRequest).digest('hex'));

    const stringToSign = [
      'GOOG4-RSA-SHA256',
      dateISO,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    this.doLog('String to Sign:', stringToSign);

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(stringToSign);
    const signature = sign.sign(this.credentials.private_key, 'hex');

    this.doLog('Generated Signature:', signature);

    return [`${this.apiEndpoint}/${cfg.file.bucket.name}/${cfg.file.name}?${canonicalQueryString}&X-Goog-Signature=${signature}`];
  }
}

