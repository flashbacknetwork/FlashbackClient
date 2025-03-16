export enum StorageType {
  S3 = 'S3',
  GCS = 'GCS',
  AZURE = 'AZURE',
}

export interface CreateUnitRequest {
  name: string;
  bucket: string;
  storageTypeId: string;
  storageType: StorageType;
  key: string;
  secret: string;
  endpoint: string;
  regionId: string;
}

export interface CreateUnitResponse {
  // TODO: Define response fields based on backend requirements
  success: boolean;
  unitId: string;
}

export interface CreateRepoRequest {
  name: string;
  storageUnitId: string[];
}

export interface CreateRepoResponse {
  // TODO: Define response fields based on backend requirements
  success: boolean;
  repoId: string;
}

export interface CreateRepoKeyRequest {
  repoId: string;
  keyName: string;
}

export interface CreateRepoKeyResponse {
  // TODO: Define response fields based on backend requirements
  success: boolean;
  keyId: string;
  keyValue: string;
  keySecret: string;
}
