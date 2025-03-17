import { CreateUnitRequest, CreateUnitResponse, CreateRepoRequest, CreateRepoResponse, StorageUnit, StorageRepo, 
  CreateRepoKeyRequest, CreateRepoKeyResponse, ApiKey } from './types';
import { IApiClient, ProviderType } from './interfaces';

export class ApiClient implements IApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string = 'https://api.flashback.tech') {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  public setAuthToken = (token: string | null) => {
    if (token) {
      this.headers = {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      this.headers = {
        'Content-Type': 'application/json',
      };
    }
  };

  public authenticate = async (token: string, provider: ProviderType): Promise<any> => {
    this.setAuthToken(token);
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.authenticateGoogle(token);
      case ProviderType.GITHUB:
        return this.authenticateGithub(token);
      case ProviderType.WEB3_STELLAR:
        return this.authenticateWeb3Stellar(token);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private authenticateWeb3Stellar = async (token: string): Promise<any> => {
    throw new Error('Not implemented');
  }

  private authenticateGoogle = async (token: string): Promise<any>  => {
    this.setAuthToken(token);
    const response = await fetch(`${this.baseURL}/auth/google`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret;
  };

  private authenticateGithub = async (code: string): Promise<any> => {
    this.setAuthToken(code);
    const response = await fetch(`${this.baseURL}/auth/github`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret;
  };

  public createStorageUnit = async (data: CreateUnitRequest): Promise<CreateUnitResponse> => {
    const response = await fetch(`${this.baseURL}/unit`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as CreateUnitResponse;
  };

  public getStorageUnits = async (): Promise<StorageUnit[]> => {
    const response = await fetch(`${this.baseURL}/unit`, {
      method: 'GET',
      headers: this.headers,
    });
    console.log('Response status:', response.status, response.ok, response.body);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as StorageUnit[];
  };

  public createRepo = async (data: CreateRepoRequest): Promise<CreateRepoResponse> => {
    const response = await fetch(`${this.baseURL}/repo`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as CreateRepoResponse;
  };

  public getRepos = async (): Promise<StorageRepo[]> => {
    const response = await fetch(`${this.baseURL}/repo`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as StorageRepo[];
  };

  public createRepoKey = async (data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse> => {
    const response = await fetch(`${this.baseURL}/repo/${data.repoId}/apikey`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as CreateRepoKeyResponse;
  };

  public getRepoKeys = async (repoId: string): Promise<ApiKey[]> => {
    const response = await fetch(`${this.baseURL}/repo/${repoId}/apikey`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as ApiKey[];
  };
}
