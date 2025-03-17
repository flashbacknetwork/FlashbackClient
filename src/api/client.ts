import { CreateUnitRequest, CreateUnitResponse, CreateRepoRequest, CreateRepoResponse, StorageUnit, StorageRepo, 
  CreateRepoKeyRequest, CreateRepoKeyResponse, ApiKey } from './types';

export class ApiClient {
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

  public authenticateGoogle = async (token: string) => {
    this.setAuthToken(token);
    const response = await fetch(`${this.baseURL}/auth/google`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  public authenticateGithub = async (code: string) => {
    this.setAuthToken(code);
    const response = await fetch(`${this.baseURL}/auth/github`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  public createStorageUnit = async (data: CreateUnitRequest): Promise<CreateUnitResponse> => {
    const response = await fetch(`${this.baseURL}/unit`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json() as Promise<CreateUnitResponse>;
  };

  public getStorageUnits = async (): Promise<StorageUnit[]> => {
    const response = await fetch(`${this.baseURL}/unit`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<StorageUnit[]>;
  };

  public createRepo = async (data: CreateRepoRequest): Promise<CreateRepoResponse> => {
    const response = await fetch(`${this.baseURL}/repo`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json() as Promise<CreateRepoResponse>;
  };

  public getRepos = async (): Promise<StorageRepo[]> => {
    const response = await fetch(`${this.baseURL}/repo`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json() as Promise<StorageRepo[]>;
  };

  public createRepoKey = async (data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse> => {
    const response = await fetch(`${this.baseURL}/repo/${data.repoId}/apikey`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json() as Promise<CreateRepoKeyResponse>;
  };

  public getRepoKeys = async (repoId: string): Promise<ApiKey[]> => {
    const response = await fetch(`${this.baseURL}/repo/${repoId}/apikey`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json() as Promise<ApiKey[]>;
  };
}
