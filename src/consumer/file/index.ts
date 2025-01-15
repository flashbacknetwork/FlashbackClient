import axios, { AxiosInstance } from 'axios';

import { DeleteParams, DeleteResponse, GetUrlParams, UploadRequest, UploadResponse } from './types';
import { upload } from './upload';
import { getUrl } from './getUrl';
import { deleteFile } from './delete';

export type { DeleteParams, DeleteResponse, GetUrlParams, UploadRequest, UploadResponse };

export interface StorageClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class StorageClient {
  private client: AxiosInstance;
  private readonly config: StorageClientConfig;

  public constructor(config: StorageClientConfig) {
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
   * Upload a file to storage
   * @param params Upload parameters including file data and type
   * @returns Promise with the file URL
   */
  async upload(params: UploadRequest): Promise<UploadResponse> {
    return upload(this.client, params);
  }

  /**
   * Get the URL for a file
   * @param params File identifier parameters
   * @returns Promise with the file URL
   */
  async getUrl(params: GetUrlParams): Promise<string> {
    return getUrl(this.client, params);
  }

  /**
   * Delete a file from storage
   * @param params File identifier parameters
   * @returns Promise indicating success
   */
  async delete(params: DeleteParams): Promise<DeleteResponse> {
    return deleteFile(this.client, params);
  }
}
