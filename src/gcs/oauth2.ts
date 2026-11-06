import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

export class MockupAuthClient extends OAuth2Client {
  async getRequestHeaders() {
    return new Headers({
      Authorization: 'Bearer test-token',
    });
  }
}

export class FlashbackAuthClient extends OAuth2Client {
  private customTokenUri: string;
  private serviceCredentials: { client_email: string; private_key: string };
  private scopes: string[];

  constructor(
    customTokenUri: string,
    serviceCredentials: { client_email: string; private_key: string },
    scopes: string[]
  ) {
    super({ forceRefreshOnFailure: true });
    this.customTokenUri = customTokenUri;
    this.serviceCredentials = serviceCredentials;
    this.scopes = scopes;
    this.refreshHandler = () => this.fetchToken();
  }

  async getAccessToken(): Promise<{ token: string | null; res: any }> {
    await this.ensureValidToken();
    return {
      token: this.credentials.access_token || null,
      res: null,
    };
  }

  async getRequestHeaders(): Promise<Headers> {
    await this.ensureValidToken();
    return new Headers({
      Authorization: `Bearer ${this.credentials.access_token}`,
    });
  }

  async getRequestMetadata(url?: string): Promise<Record<string, string>> {
    await this.ensureValidToken();
    return {
      Authorization: `Bearer ${this.credentials.access_token}`,
    };
  }

  async authorizeRequest(reqOpts: any): Promise<any> {
    const headers = new Headers(reqOpts.headers);
    (await this.getRequestHeaders()).forEach((value, name) => headers.set(name, value));
    return {
      ...reqOpts,
      headers,
    };
  }

  private async ensureValidToken() {
    const now = Date.now();
    if (
      !this.credentials.access_token ||
      !this.credentials.expiry_date ||
      now >= this.credentials.expiry_date
    ) {
      await this.fetchToken();
    }
  }

  private async fetchToken() {
    // Create JWT assertion like the Python SDK
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: this.serviceCredentials.client_email,
      sub: this.serviceCredentials.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
      scope: this.scopes.join(' '),
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const crypto = require('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(this.serviceCredentials.private_key, 'base64url');
    const assertion = `${signatureInput}.${signature}`;

    // Request token from custom endpoint
    const formData = new URLSearchParams();
    formData.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    formData.append('assertion', assertion);

    const response = await axios.post<{ access_token: string; expires_in: number; token_type?: string }>(this.customTokenUri, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const credentials = {
      access_token: response.data.access_token,
      expiry_date: (now + response.data.expires_in) * 1000, // Convert to milliseconds
      token_type: response.data.token_type || 'Bearer',
    };
    this.setCredentials(credentials);
    return credentials;
  }
}
