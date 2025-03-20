import { CreateUnitRequest, CreateUnitResponse, CreateRepoRequest, CreateRepoResponse, StorageUnit, StorageRepo, 
  CreateRepoKeyRequest, CreateRepoKeyResponse, ApiKey, GetUnitsResponse, GetReposResponse, GetRepoKeysResponse,
  UpdateUnitRequest, UpdateUnitResponse, ActionResponse, UpdateRepoRequest, UpdateRepoResponse, 
  UpdateRepoKeyRequest, UpdateRepoKeyResponse 
} from './types/storage';
import { IApiClient, ProviderType } from './interfaces';
import { RefreshTokenResponse } from './types/auth';

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

  private refreshTokenGoogle = async (refreshToken: string): Promise<RefreshTokenResponse> => {
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

  private makeRequest = async <T>(path: string, method: string, data: any | null): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: this.headers,
        body: data ? JSON.stringify(data) : null,
    }
    const response = await fetch(`${this.baseURL}/${path}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ret = await response.json();
    return ret as T;
  }

  ////// Units API
  public createStorageUnit = async (data: CreateUnitRequest): Promise<CreateUnitResponse> => {
    return this.makeRequest<CreateUnitResponse>('unit', 'POST', data);
  };

  public getStorageUnits = async (): Promise<GetUnitsResponse> => {
    return this.makeRequest<GetUnitsResponse>('unit', 'GET', {});
  };

  public updateStorageUnit = async (unitId: string, data: UpdateUnitRequest): Promise<UpdateUnitResponse> => {
    return this.makeRequest<UpdateUnitResponse>(`unit/${unitId}`, 'PUT', data);
  }

  public deleteStorageUnit = async (unitId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`unit/${unitId}`, 'DELETE', {});
  }

  ////// Repos API
  public createRepo = async (data: CreateRepoRequest): Promise<CreateRepoResponse> => {
    return this.makeRequest<CreateRepoResponse>('repo', 'POST', data);
  };

  public getRepos = async (): Promise<GetReposResponse> => {
    return this.makeRequest<GetReposResponse>('repo', 'GET', {});
  };

  public updateRepo = async (repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse> => {
    return this.makeRequest<UpdateRepoResponse>(`repo/${repoId}`, 'PUT', data);
  };

  public deleteRepo = async (repoId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}`, 'DELETE', {});
  };

  ////// Keys API
  public createRepoKey = async (data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse> => {
    return this.makeRequest<CreateRepoKeyResponse>(`repo/${data.repoId}/apikey`, 'POST', data);
  };

  public getRepoKeys = async (repoId: string): Promise<GetRepoKeysResponse> => {
    return this.makeRequest<GetRepoKeysResponse>(`repo/${repoId}/apikey`, 'GET', {});
  };

  public updateRepoKey = async (repoId: string, data: UpdateRepoKeyRequest): Promise<UpdateRepoKeyResponse> => {
    return this.makeRequest<UpdateRepoKeyResponse>(`repo/${repoId}/apikey`, 'PUT', data);
  };

  public deleteRepoKey = async (repoId: string, keyId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}/apikey/${keyId}`, 'DELETE', {});
  };
} 
