import { Storage, StorageOptions, File } from '@google-cloud/storage';

import { FlashbackAuthClient } from './oauth2';
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
  action: 'write' | 'read' | 'delete';
  expires: number;
  contentType: string;
  file: File;
}

export class FlashbackGCSStorage extends Storage {
  protected credentials: ServiceCredentials;
  private debug: boolean = false;
  public apiEndpoint: string;
  private currentUploadContentType: string | undefined;

  constructor(opts: FlashbackStorageOptions) {
    const {
      credentials,
      apiEndpoint = 'https://gcs-us-east-1-gcp.flashback.tech',
      tokenScopes = ['READ', 'WRITE'],
      interceptors_ = [],
      ...rest
    } = opts;

    // Ensure the endpoint doesn't have a trailing slash
    const cleanEndpoint = apiEndpoint.replace(/\/$/, '');
    const authClient = new FlashbackAuthClient(cleanEndpoint + '/token', credentials, tokenScopes);
    const authenticatedAdapter = <T>(options: Parameters<FlashbackAuthClient['request']>[0]) =>
      new Promise<Awaited<ReturnType<typeof authClient.transporter.request<T>>>>((resolve, reject) => {
        authClient.request<T>({ ...options, adapter: undefined }, (error, response) => {
          // Let the outer Gaxios version construct HTTP errors with their response intact.
          if (response) resolve(response);
          else reject(error);
        });
      });

    super({
      ...rest,
      apiEndpoint: cleanEndpoint,
      authClient,
      useAuthWithCustomEndpoint: true,
      // Storage 8 omits the custom-endpoint auth flag on its resumable-upload path.
      interceptors_: [...interceptors_, { request: options => ({
        ...options,
        uri: 'uri' in options ? options.uri : options.url,
        adapter: authenticatedAdapter,
      }) }],
      retryOptions: {
        autoRetry: true,
        maxRetries: 3,
      },
    });

    this.credentials = credentials;
    this.apiEndpoint = cleanEndpoint;
  }

  // Retained for callers that previously restored process-global transport hooks.
  cleanup() {
  }

  // Override the bucket method to ensure we pass the auth client
  bucket(name: string) {
    const bucket = super.bucket(name);
    const originalUpload = bucket.upload.bind(bucket);

    bucket.upload = async (filePath: string, options?: any) => {
      this.currentUploadContentType = options?.contentType;
      try {
        return await originalUpload(filePath, options);
      } finally {
        this.currentUploadContentType = undefined;
      }
    };

    return bucket;
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
    const expiresPeriodInSeconds = Math.floor(
      (expires - accessibleAt.valueOf()) * millisecondsToSeconds
    );

    this.doLog('Signing Parameters:', {
      action,
      expires,
      expiresPeriodInSeconds,
      accessibleAt: accessibleAt.toISOString(),
      contentType,
    });

    if (expiresPeriodInSeconds > 604800) {
      // 7 days in seconds
      throw new Error('Max allowed expiration is seven days (604800 seconds).');
    }

    const extensionHeaders: Record<string, string> = {};
    extensionHeaders.host = new URL(this.apiEndpoint).hostname;
    if (contentType) {
      extensionHeaders['content-type'] = contentType;
    }

    // Sort headers once and use the same order for both signedHeaders and canonicalHeaders
    const sortedHeaderKeys = Object.keys(extensionHeaders)
      .map((header) => header.toLowerCase())
      .sort();

    const signedHeaders = sortedHeaderKeys.join(';');

    const canonicalHeaders =
      sortedHeaderKeys.map((key) => `${key}:${extensionHeaders[key.toLowerCase()]}`).join('\n') +
      '\n';

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
    this.doLog(
      'Canonical Request Hash:',
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    );

    const stringToSign = [
      'GOOG4-RSA-SHA256',
      dateISO,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const canonicalRequestHex = Buffer.from(canonicalRequest).toString('hex');
    this.doLog('String to Sign:', stringToSign, canonicalRequestHex);

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(stringToSign);
    const signature = sign.sign(this.credentials.private_key, 'hex');

    this.doLog('Generated Signature:', signature);

    return [
      `${this.apiEndpoint}/${cfg.file.bucket.name}/${cfg.file.name}?${canonicalQueryString}&X-Goog-Signature=${signature}`,
    ];
  }
}
