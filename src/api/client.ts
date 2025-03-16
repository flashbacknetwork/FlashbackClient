import axios, { AxiosInstance } from 'axios';
import { CreateUnitRequest, CreateUnitResponse } from './types';

export class ApiClient {
  private apiClient: AxiosInstance;

  constructor(baseURL: string = 'https://api.flashback.tech') {
    this.apiClient = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  public setAuthToken = (token: string | null) => {
    if (token) {
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.apiClient.defaults.headers.common['Authorization'];
    }
  };

  public authenticateGoogle = async (token: string) => {
    const response = await this.apiClient.post('/auth/google', { token });
    return response.data;
  };

  public authenticateGithub = async (code: string) => {
    const response = await this.apiClient.post('/auth/github', { code });
    return response.data;
  };

  public createStorageUnit = async (data: CreateUnitRequest): Promise<CreateUnitResponse> => {
    const response = await this.apiClient.post('/unit', data);
    return response.data as CreateUnitResponse;
  };
}
