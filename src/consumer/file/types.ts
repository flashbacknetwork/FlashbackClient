import type { Buffer, Blob, File } from 'buffer';

// Types for request/response
export interface UploadRequest {
  folderId: string;
  fileId: string;
  data: string | Buffer | ArrayBuffer | Blob | File | globalThis.File;
  type: 'base64' | 'binary' | 'multipart';
}

export interface UploadResponse {
  url: string;
}

export interface GetUrlParams {
  folderId: string;
  fileId: string;
}

export interface DeleteParams {
  folderId: string;
  fileId: string;
}

export interface DeleteResponse {
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
