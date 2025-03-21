import { CreateUnitRequest, CreateUnitResponse, CreateRepoRequest, CreateRepoResponse, StorageUnit, StorageRepo, 
  CreateRepoKeyRequest, CreateRepoKeyResponse, ApiKey, GetUnitsResponse, GetReposResponse, GetRepoKeysResponse,
  UpdateUnitRequest, UpdateUnitResponse, ActionResponse, UpdateRepoRequest, UpdateRepoResponse, 
  UpdateRepoKeyRequest, UpdateRepoKeyResponse 
} from './types/storage';
import { IApiClient, ProviderType } from './interfaces';
import { OAuth2ResponseDTO, RefreshTokenResponse } from './types/auth';

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: ErrorResponse
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError'; // This helps in instanceof checks
  }
}

export class ApiClient implements IApiClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private debug: boolean;

  constructor(baseURL: string = 'https://api.flashback.tech') {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.debug = false;
  }

  public setDebug = (debug: boolean) => {
    this.debug = debug;
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

  public exchangeCode = async (code: string, provider: ProviderType): Promise<OAuth2ResponseDTO> => {
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

  private exchangeGithubCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    throw new Error('Not implemented');
  }

  private exchangeWeb3StellarCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    throw new Error('Not implemented');
  }

  /**
   * Refresh the token for the given provider
   * @param refreshToken - The refresh token to use
   * @param provider - The provider to refresh the token for
   * @returns The refreshed token
   */
  public refreshToken = async (refreshToken: string, provider: ProviderType): Promise<RefreshTokenResponse> => {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.refreshGoogleToken(refreshToken);
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

  private makeRequest = async <T>(path: string, method: string, data?: any): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: this.headers,
        body: data ? JSON.stringify(data) : null,
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (this.debug) {
      console.log(`DEBUG: ${method} ${cleanPath} ${JSON.stringify(data)}`);
    }
    const response = await fetch(`${this.baseURL}/${cleanPath}`, options);
    if (this.debug) {
      console.log(`DEBUG: ${response.status} ${response.statusText}`);
    }
    
    // If response is not ok, handle it before trying to parse JSON
    if (!response.ok) {
        let errorData = null;
        
        // Only try to parse JSON if we have content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                const text = await response.text(); 
                errorData = text ? JSON.parse(text) : null; // Parse if not empty
            } catch (e) {
                console.debug('Failed to parse error response:', e);
            }
        }

        throw new HttpError(
            response.status,
            response.statusText,
            errorData
        );
    }

    // For successful responses, parse JSON if we have content
    try {
        const text = await response.text();
        return text ? JSON.parse(text) : null as T;
    } catch (e) {
        console.error('Failed to parse success response:', e);
        throw new Error('Invalid JSON response from server');
    }
  }

  ////// Auth API
  private authenticateGoogle = async (token: string): Promise<any>  => {
    this.setAuthToken(token);
    return this.makeRequest<any>('auth/google', 'POST', { token });
  };

  private authenticateGithub = async (code: string): Promise<any> => {
    this.setAuthToken(code);
    return this.makeRequest<any>('auth/github', 'POST', { code });
  };

  private refreshGoogleToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return this.makeRequest<RefreshTokenResponse>('auth/google/refresh', 'POST', { refresh_token: refreshToken });
  };
  
  private exchangeGoogleCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    return this.makeRequest<OAuth2ResponseDTO>('auth/google/exchange', 'POST', { code });
  }

  ////// Units API
  public createStorageUnit = async (data: CreateUnitRequest): Promise<CreateUnitResponse> => {
    return this.makeRequest<CreateUnitResponse>('unit', 'POST', data);
  };

  public getStorageUnits = async (): Promise<GetUnitsResponse> => {
    return this.makeRequest<GetUnitsResponse>('unit', 'GET', null);
  };

  public updateStorageUnit = async (unitId: string, data: UpdateUnitRequest): Promise<UpdateUnitResponse> => {
    return this.makeRequest<UpdateUnitResponse>(`unit/${unitId}`, 'PUT', data);
  }

  public deleteStorageUnit = async (unitId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`unit/${unitId}`, 'DELETE', null);
  }

  ////// Repos API
  public createRepo = async (data: CreateRepoRequest): Promise<CreateRepoResponse> => {
    return this.makeRequest<CreateRepoResponse>('repo', 'POST', data);
  };

  public getRepos = async (): Promise<GetReposResponse> => {
    return this.makeRequest<GetReposResponse>('repo', 'GET', null);
  };

  public updateRepo = async (repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse> => {
    return this.makeRequest<UpdateRepoResponse>(`repo/${repoId}`, 'PUT', data);
  };

  public deleteRepo = async (repoId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}`, 'DELETE', null);
  };

  ////// Keys API
  public createRepoKey = async (data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse> => {
    return this.makeRequest<CreateRepoKeyResponse>(`repo/${data.repoId}/apikey`, 'POST', data);
  };

  public getRepoKeys = async (repoId: string): Promise<GetRepoKeysResponse> => {
    return this.makeRequest<GetRepoKeysResponse>(`repo/${repoId}/apikey`, 'GET', null);
  };

  public updateRepoKey = async (repoId: string, data: UpdateRepoKeyRequest): Promise<UpdateRepoKeyResponse> => {
    return this.makeRequest<UpdateRepoKeyResponse>(`repo/${repoId}/apikey`, 'PUT', data);
  };

  public deleteRepoKey = async (repoId: string, keyId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}/apikey/${keyId}`, 'DELETE', null);
  };
} 
