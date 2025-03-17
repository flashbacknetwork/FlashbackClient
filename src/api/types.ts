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

export enum ModeType {
  NORMAL = 'NORMAL',
  MIRROR = 'MIRROR',
}

export interface CreateUnitRequest {
  name: string;
  bucket: string;
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

export interface RepoUnitInfo {
  id: string;
  folder: string;
}

export interface CreateRepoRequest {
  name: string;
  storageType: StorageType;
  mode: ModeType;
  repoUnits: RepoUnitInfo[];
}

export interface CreateRepoResponse {
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

export interface StorageRepo {
  id: string;
  name: string;
  storageType: StorageType;
  mode: ModeType;
  repoUnits: RepoUnitInfo[];
  apiKeys: ApiKey[];
}

export interface ApiKey {
  id: string;
  name: string;
  accessType: AccessType;
  key: string;
  secret: string;
}

export interface StorageUnit {
  id: string;
  name: string;
  bucket: string;
  storageType: StorageType;
  key: string;
  secret: string;
  endpoint?: string;
  regionId?: string;
}

export interface GetUnitsResponse {
  success: boolean;
  units: StorageUnit[];
}

export interface GetReposResponse {
  success: boolean;
  repos: StorageRepo[];
}

export interface GetRepoKeysResponse {
  success: boolean;
  keys: ApiKey[];
}
