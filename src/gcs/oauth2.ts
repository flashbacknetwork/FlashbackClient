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
    private clientEmail: string;
    private privateKey: string;

    constructor(
        private authUrl: string,
        private scopes: string[],
        credentials: ServiceCredentials
    ) {
        super();
        this.clientEmail = credentials.client_email;
        this.privateKey = credentials.private_key;
    }

    private async fetchToken() {
        const response = await axios.post(this.authUrl, {
            client_email: this.clientEmail,
            private_key: this.privateKey,
            scopes: this.scopes,
        });

        const { access_token, expires_in } = response.data;
        this.token = access_token;
        this.tokenExpiry = Date.now() + (expires_in * 1000) - 10_000;
    }

    private async ensureValidToken() {
        if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
            await this.fetchToken();
        }
    }

    async getAccessToken(): Promise<{ token: string | null; res?: any }> {
        await this.ensureValidToken();
        return { token: this.token };
    }

    async getRequestHeaders(): Promise<Record<string, string>> {
        await this.ensureValidToken();
        return {
            Authorization: `Bearer ${this.token}`,
        };
    }

    async getRequestMetadata(url?: string): Promise<Record<string, string>> {
        await this.ensureValidToken();
        return {
            Authorization: `Bearer ${this.token}`,
        };
    }

    async request<T = any>(opts: any): Promise<GaxiosResponse<T>> {
        await this.ensureValidToken();

        // Ensure headers are set for all request types
        const headers = await this.getRequestHeaders();
        opts.headers = {
            ...(opts.headers || {}),
            ...headers,
        };

        return super.request<T>(opts);
    }
}