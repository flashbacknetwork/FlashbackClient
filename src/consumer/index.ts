/// <reference lib="dom" />
import type { Buffer, Blob, File } from 'buffer';
import axios, { AxiosInstance } from 'axios';
import { FormData } from 'formdata-node';

// Types for request/response
export interface UploadRequest {
  folderId: string;
  fileId: string;
  data: string | Blob | Buffer | File | ArrayBuffer; // Base64 encoded file data
  type: 'base64' | 'binary' | 'multipart';
}

export interface UploadResponse {
  url: string;
}

export interface GetUrlParams {
  folder_id: string;
  file_id: string;
}

export interface DeleteParams {
  folder_id: string;
  file_id: string;
}

export interface DeleteResponse {
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

interface StorageClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class StorageClient {
  private static instance: StorageClient | null = null;
  private client: AxiosInstance;
  private readonly config: StorageClientConfig;

  private constructor(config: StorageClientConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });
  }

  /**
   * Initialize and get the StorageClient instance
   * @param config - Configuration for the storage service
   * @returns StorageClient instance
   */
  public static initialize(config: StorageClientConfig): StorageClient {
    if (!StorageClient.instance) {
      StorageClient.instance = new StorageClient(config);
    }
    return StorageClient.instance;
  }

  /**
   * Get the current instance of StorageClient
   * @throws Error if client hasn't been initialized
   */
  public static getInstance(): StorageClient {
    if (!StorageClient.instance) {
      throw new Error('StorageClient has not been initialized. Call initialize() first.');
    }
    return StorageClient.instance;
  }

  /**
   * Reset the client instance (useful for testing or reconfiguration)
   */
  public static reset(): void {
    StorageClient.instance = null;
  }

  /**
   * Upload a file to storage
   * @param params Upload parameters including file data and type
   * @returns Promise with the file URL
   */
  async upload(params: UploadRequest): Promise<UploadResponse> {
    try {
      let url = '';

      switch (params.type) {
        case 'multipart': {
          const formData = new FormData();
          formData.append('type', 'multipart');
          formData.append('folderId', params.folderId);
          formData.append('fileId', params.fileId);
          formData.append('file', params.data as Blob);

          const response = await this.client.post('/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            // Note: axios will automatically set the correct Content-Type boundary
          });
          url = response.data.url;
          break;
        }
        case 'binary': {
          // Binary upload
          const response = await this.client.post('/', params.data, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'x-upload-type': 'binary',
              'x-folder-id': params.folderId,
              'x-file-id': params.fileId,
            },
          });
          url = response.data.url;
          break;
        }
        case 'base64': {
          const response = await this.client.post(
            '/',
            {
              type: 'base64',
              folderId: params.folderId,
              fileId: params.fileId,
              data: params.data as string,
            },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          url = response.data.url;
          break;
        }
        default:
          throw new Error('Invalid file type');
      }
      return { url };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(`Upload failed: ${errorData.message}`);
      }
      throw error;
    }
  }

  /**
   * Get the URL for a file
   * @param params File identifier parameters
   * @returns Promise with the file URL
   */
  async getUrl(params: GetUrlParams): Promise<UploadResponse> {
    try {
      const { data } = await this.client.get<UploadResponse>('/', { params });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(`Get URL failed: ${errorData.message}`);
      }
      throw error;
    }
  }

  /**
   * Delete a file from storage
   * @param params File identifier parameters
   * @returns Promise indicating success
   */
  async delete(params: DeleteParams): Promise<DeleteResponse> {
    try {
      const { data } = await this.client.delete<DeleteResponse>('/', { params });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(`Delete failed: ${errorData.message}`);
      }
      throw error;
    }
  }
}
