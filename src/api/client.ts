import { CreateUnitRequest, CreateUnitResponse, CreateRepoRequest, CreateRepoResponse, StorageUnit, StorageRepo, 
  CreateRepoKeyRequest, CreateRepoKeyResponse, ApiKey, GetUnitsResponse, GetReposResponse, GetRepoKeysResponse } from './types/storage';
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

  public exchangeCode = async (code: string, provider: ProviderType): Promise<any> => {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.exchangeGoogleCode(code);
      case ProviderType.GITHUB:
        return this.exchangeGithubCode(code);
      case ProviderType.WEB3_STELLAR:
        return this.exchangeWeb3StellarCode(code);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private exchangeGoogleCode = async (code: string): Promise<any> => {
    const response = await fetch(`${this.baseURL}/auth/google/exchange`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret;
  }

  private exchangeGithubCode = async (code: string): Promise<any> => {
    throw new Error('Not implemented');
  }

  private exchangeWeb3StellarCode = async (code: string): Promise<any> => {
    throw new Error('Not implemented');
  }

  /**
   * Refresh the token for the given provider
   * @param refreshToken - The refresh token to use
   * @param provider - The provider to refresh the token for
   * @returns The refreshed token
   */
  public refreshToken = async (refreshToken: string, provider: ProviderType): Promise<any> => {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.refreshTokenGoogle(refreshToken);
      case ProviderType.GITHUB:
        // TODO: Implement refresh token for Github
        throw new Error('Not implemented');
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

  private refreshTokenGoogle = async (refreshToken: string): Promise<any> => {
    const response = await fetch(`${this.baseURL}/auth/google/refresh`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ refresh_token: refreshToken }),
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

  public getStorageUnits = async (): Promise<GetUnitsResponse> => {
    const response = await fetch(`${this.baseURL}/unit`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const ret = await response.json();
    return ret as GetUnitsResponse;
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

  public getRepos = async (): Promise<GetReposResponse> => {
    const response = await fetch(`${this.baseURL}/repo`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as GetReposResponse;
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

  public getRepoKeys = async (repoId: string): Promise<GetRepoKeysResponse> => {
    const response = await fetch(`${this.baseURL}/repo/${repoId}/apikey`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as GetRepoKeysResponse;
  };
}
