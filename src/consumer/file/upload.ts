/// <reference lib="dom" />
//import type { Blob } from 'buffer';
import { FormData } from 'formdata-node';

import { UploadRequest, UploadResponse, ErrorResponse } from './types';
import axios, { AxiosInstance } from 'axios';

export async function upload(
  client: AxiosInstance,
  params: UploadRequest
): Promise<UploadResponse> {
  try {
    let url = '';

    switch (params.type) {
      case 'multipart': {
        const formData = new FormData();
        formData.append('type', 'multipart');
        formData.append('folderId', params.folderId);
        formData.append('fileId', params.fileId);

        // If params.data is already a Blob/File, use it directly
        // Otherwise, create a new Blob with the correct type
        const fileBlob = params.data as globalThis.Blob;
        formData.append('file', fileBlob);

        const response = await client.post('/file/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Prevent any data transformation
          transformRequest: [(data) => data],
          // Ensure binary data handling
          responseType: 'json',
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });
        url = response.data.url;
        break;
      }
      case 'binary': {
        // Binary upload
        const response = await client.post('/file/', params.data, {
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
        const response = await client.post(
          '/file/',
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
