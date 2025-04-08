import { Storage, StorageOptions, File } from '@google-cloud/storage';


import { FlashbackAuthClient, MockupAuthClient } from './oauth2';
import crypto from 'crypto';

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
  action: 'write' | 'read';
  expires: number;
  contentType: string;
  file: File;
}

export class FlashbackGCSStorage extends Storage {
  protected credentials: ServiceCredentials;

  constructor(opts: FlashbackStorageOptions) {
    const {
      credentials,
      apiEndpoint = 'https://gcs.us-east-1.flashback.tech',
      tokenScopes = ['READ', 'WRITE'],
      ...rest
    } = opts;

    const authClient = new FlashbackAuthClient(apiEndpoint + '/token', tokenScopes, credentials);

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

    this.credentials = credentials;
  }

  // Override the getSignedUrl method
  async getSignedUrl(cfg: SignedUrlOptions): Promise<[string]> {
    const { version, action, expires, contentType } = cfg;
    const accessibleAt = new Date();
    const millisecondsToSeconds = 1.0 / 1000.0;
    const expiresPeriodInSeconds = Math.floor((expires - accessibleAt.valueOf()) * millisecondsToSeconds);
    
    console.log('Signing Parameters:', {
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

    const canonicalRequest = [
      action === 'read' ? 'GET' : 'PUT',
      `/${cfg.file.bucket.name}/${cfg.file.name}`,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    console.log('Canonical Request:', canonicalRequest);
    console.log('Canonical Request Hash:', crypto.createHash('sha256').update(canonicalRequest).digest('hex'));

    const stringToSign = [
      'GOOG4-RSA-SHA256',
      dateISO,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    console.log('String to Sign:', stringToSign);

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(stringToSign);
    const signature = sign.sign(this.credentials.private_key, 'hex');

    console.log('Generated Signature:', signature);

    return [`${this.apiEndpoint}/${cfg.file.bucket.name}/${cfg.file.name}?${canonicalQueryString}&X-Goog-Signature=${signature}`];
  }

}

