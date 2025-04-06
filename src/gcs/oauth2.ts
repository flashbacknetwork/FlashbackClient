import { OAuth2Client } from 'google-auth-library';
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
    private token: string | null = null;
    private tokenExpiry: number | null = null;

    constructor(
        private authUrl: string,
        private scopes: string[],
        private creds: ServiceCredentials
    ) {
        super();
        console.log('FlashbackAuthClient created with URL:', authUrl);
    }

    private async fetchToken() {
        const response = await axios.post(this.authUrl, {
            client_email: this.creds.client_email,
            private_key: this.creds.private_key,
            scopes: this.scopes,
        });

        const { access_token, expires_in } = response.data;
        this.token = access_token;
        this.tokenExpiry = Date.now() + (expires_in * 1000) - 10_000;
        this.credentials.access_token = this.token;
        this.credentials.expiry_date = this.tokenExpiry
    }

    private async ensureValidToken() {
        const now = Date.now();

        if (!this.credentials.access_token || !this.credentials.expiry_date || now >= this.credentials.expiry_date) {
            await this.fetchToken();
        }
    }

    async getRequestHeaders(): Promise<Record<string, string>> {
        await this.ensureValidToken();
        return {
          Authorization: `Bearer ${this.credentials.access_token}`,
        };
      }
    
      async getAccessToken(): Promise<{ token: string | null }> {
        await this.ensureValidToken();
        return { token: this.credentials.access_token ?? null };
      }

    async request<T = any>(opts: any): Promise<GaxiosResponse<T>> {
        console.log('FlashbackAuthClient request called for URL:', opts.url);
        await this.ensureValidToken();
        
        const headers = {
            ...(opts.headers || {}),
            Authorization: `Bearer ${this.credentials.access_token}`,
        };
        
        console.log('Request Headers:', headers);
        
        return super.request<T>({
            ...opts,
            headers,
        });
    }

    async getRequestMetadata(url?: string): Promise<Record<string, string>> {
        await this.ensureValidToken();
        // Always return auth headers for all requests
        return {
            Authorization: `Bearer ${this.credentials.access_token}`,
        };
    }

    async authorizeRequest(reqOpts: any): Promise<any> {
        await this.ensureValidToken();
        return {
            ...reqOpts,
            headers: {
                ...(reqOpts.headers || {}),
                Authorization: `Bearer ${this.credentials.access_token}`,
            },
        };
    }
}