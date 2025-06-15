import { OAuth2Client, GoogleAuth, Credentials, AuthClient } from 'google-auth-library';
import axios from 'axios';
import { ServiceCredentials } from './storage';
import { GaxiosResponse } from 'gaxios';

export class MockupAuthClient extends OAuth2Client {
  async getRequestHeaders() {
    return {
      Authorization: 'Bearer test-token',
    };
  }
}

export class FlashbackAuthClient extends OAuth2Client {
  private creds: ServiceCredentials;
  private _credentials: Credentials | null = null;
  private scopes: string[];

  constructor(
    private authUrl: string,
    scopes: string[],
    credentials: ServiceCredentials
  ) {
    super();
    this.creds = credentials;
    this.scopes = scopes;
    console.log('FlashbackAuthClient created with URL:', authUrl);
  }

  async getCredentials() {
    return {
      client_email: this.creds.client_email,
      private_key: this.creds.private_key,
    };
  }

  async getAccessToken() {
    await this.ensureValidToken();
    return {
      token: this._credentials?.access_token || null,
      res: null,
    };
  }

  async getRequestHeaders(): Promise<Record<string, string>> {
    await this.ensureValidToken();
    return {
      Authorization: `Bearer ${this._credentials?.access_token}`,
    };
  }

  private async ensureValidToken() {
    const now = Date.now();
    if (
      !this._credentials?.access_token ||
      !this._credentials?.expiry_date ||
      now >= this._credentials.expiry_date
    ) {
      await this.fetchToken();
    }
  }

  private async fetchToken() {
    const response = await axios.post(this.authUrl, {
      client_email: this.creds.client_email,
      private_key: this.creds.private_key,
      scopes: this.scopes,
    });

    const { access_token, expires_in } = response.data;
    this._credentials = {
      access_token,
      expiry_date: Date.now() + expires_in * 1000 - 10_000,
    };
  }

  async request<T = any>(opts: any): Promise<GaxiosResponse<T>> {
    await this.ensureValidToken();

    const headers = {
      ...(opts.headers || {}),
      Authorization: `Bearer ${this._credentials?.access_token}`,
    };

    const response = await axios.request<T>({
      ...opts,
      headers,
    });

    return {
      config: opts,
      data: response.data,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    } as GaxiosResponse<T>;
  }

  async getRequestMetadata(url?: string): Promise<Record<string, string>> {
    await this.ensureValidToken();
    return {
      Authorization: `Bearer ${this._credentials?.access_token}`,
    };
  }

  async authorizeRequest(reqOpts: any): Promise<any> {
    await this.ensureValidToken();
    return {
      ...reqOpts,
      headers: {
        ...(reqOpts.headers || {}),
        Authorization: `Bearer ${this._credentials?.access_token}`,
      },
    };
  }
}
