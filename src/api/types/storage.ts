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

export interface ActionResponse {
  success: boolean;
  message?: string;
}

export interface CreateUnitRequest {
  name: string;
  bucket: string;
  storageType: StorageType;
  key: string;
  secret: string;
  endpoint?: string;
  region?: string;
}

export interface UpdateUnitRequest extends CreateUnitRequest {}

export interface CreateUnitResponse {
  success: boolean;
  unitId: string;
}

export interface UpdateUnitResponse extends CreateUnitResponse {
  status?: string;
  latency_ms?: number;
}

export interface RepoUnitInfo {
  id: string;
  folder: string;
  master: boolean;
  data?: StorageUnit;
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

export interface UpdateRepoRequest extends CreateRepoRequest {}
export interface UpdateRepoResponse extends CreateRepoResponse {}

export interface CreateRepoKeyRequest {
  repoId: string;
  name: string;
  accessType: AccessType;
}

export interface CreateRepoKeyResponse {
  success: boolean;
  id: string;
  key: string;
  secret: string;
}

export interface UpdateRepoKeyRequest extends CreateRepoKeyRequest {}
export interface UpdateRepoKeyResponse extends CreateRepoKeyResponse {}

export interface StorageRepo {
  id: string;
  name: string;
  storageType: StorageType;
  mode: ModeType;
  repoUnits: RepoUnitInfo[];
  apiKeys: ApiKey[];
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  accessType: AccessType;
  key: string;
  secret: string;
  createdAt: string;
}

export interface StorageUnit {
  id: string;
  name: string;
  bucket: string;
  storageType: StorageType;
  key: string;
  secret: string;
  endpoint?: string;
  region?: string;
  status?: string;
  latency_ms?: number;
  projectId?: string;
  createdAt: string;
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

export interface ValidateUnitRequest {
  key: string;
  secret: string;
  endpoint?: string;
  bucket: string;
}

export interface ValidateUnitResponse {
  success: boolean;
  message?: string;
  status?: string;
  latency_ms?: number;
}

