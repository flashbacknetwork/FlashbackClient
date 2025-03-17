import { CreateUnitRequest, CreateUnitResponse } from './types';

export class ApiClient {
  private baseURL: string;
  private headers: HeadersInit;

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
    const response = await fetch(`${this.baseURL}/auth/google`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  public authenticateGithub = async (code: string) => {
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
}
