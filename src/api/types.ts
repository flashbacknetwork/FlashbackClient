export enum StorageType {
  S3 = 'S3',
  GCS = 'GCS',
  AZURE = 'AZURE',
}

export enum AccessType {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
}

export interface CreateUnitRequest {
  name: string;
  bucket: string;
  storageTypeId: string;
  storageType: StorageType;
  key: string;
  secret: string;
  endpoint?: string;
  regionId?: string;
}

export interface CreateUnitResponse {
  // TODO: Define response fields based on backend requirements
  success: boolean;
  unitId: string;
}

export interface CreateRepoRequest {
  name: string;
  storageType: StorageType;
  storageUnitIds: string[];
}

export interface CreateRepoResponse {
  // TODO: Define response fields based on backend requirements
  success: boolean;
  repoId: string;
}

export interface CreateRepoKeyRequest {
  repoId: string;
  name: string;
  accessType: AccessType;
}

export interface CreateRepoKeyResponse {
  // TODO: Define response fields based on backend requirements
  success: boolean;
  id: string;
  key: string;
  secret: string;
}
