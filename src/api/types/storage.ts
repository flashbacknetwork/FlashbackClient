import { NodeStatusInfo, NodeStatusType } from './bridge';

export enum StorageType {
  S3 = 'S3',
  GCS = 'GCS',
  BLOB = 'BLOB',
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
  workspaceId: string;
}

export interface GetUnitNodeStatsRequest {
  day: Date;
}

export interface GetUnitNodeStatsResponse {
  success: boolean;
  nodeStats: UnitNodeStatsDailyInfo[];
}

export interface UnitNodeStatsDailyInfo {
  ip: string;
  host: string;
  perc_uptime: number;
  avg_latency_ms: number;
  version: string;
  node_status: NodeStatusType;
  last_updated: string;
  last_latency_ms: number;
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
  folder: string;
  master: boolean;
  unitId?: string;
  unit?: StorageUnit;
}

export interface CreateRepoRequest {
  name: string;
  storageType: StorageType;
  mode: ModeType;
  repoUnits: RepoUnitInfo[];
  workspaceId: string;
}

export interface CreateRepoResponse {
  success: boolean;
  error_code?: RepoErrorCodes;
  error_message?: string;
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

export interface UpdateRepoKeyRequest {
  name: string;
  accessType: AccessType;
}

export interface UpdateRepoKeyResponse extends ActionResponse {}

export interface StorageRepo {
  id: string;
  name: string;
  storageType: StorageType;
  mode: ModeType;
  units: RepoUnitInfo[];
  apiKeys?: ApiKey[];
  createdAt: string;
  disabled?: boolean;
  workspaceId: string;
}

export interface ApiKey {
  id: string;
  name: string;
  accessType: AccessType;
  key: string;
  secret?: EncryptedKey;
  createdAt: string;
}

export interface EncryptedKey {
  key: string;
  iv: string;
  authTag: string;
  message: string;
}

export interface StorageUnit {
  id: string;
  name: string;
  bucket: string;
  storageType: StorageType;
  key: string;
  secret?: EncryptedKey;
  endpoint?: string;
  region?: string;
  status?: string;
  projectId?: string;
  createdAt: string;
  workspaceId: string;
}

export interface GetUnitsResponse {
  success: boolean;
  units: StorageUnit[];
}

export interface GetReposResponse {
  success: boolean;
  repos: StorageRepoWithBuckets[];
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

export interface ValidateRepoUnitsRequest {
  repoId: string;
  mode: ModeType;
  repoUnits: RepoUnitInfo[];
}

export interface ValidateRepoUnitsResponse {
  success: boolean;
  error_code?: RepoErrorCodes;
  error_message?: string;
}

export interface StorageUnitStatusResponse {
  unitId: string;
  nodeStatus: NodeStatusInfo[];
}

export enum RepoErrorCodes {
  SUCCESS = 'SUCCESS',
  NOT_FOUND = 'NOT_FOUND',
  NAME_ALREADY_USED = 'NAME_ALREADY_USED',
  MIRROR_MASTER_UNIT_COUNT_INVALID = 'MIRROR_MASTER_UNIT_COUNT_INVALID',
  MIRROR_MASTER_UNIT_MISSING = 'MIRROR_MASTER_UNIT_MISSING',
  MIRROR_UNIT_ALREADY_IN_OTHER_REPO = 'MIRROR_UNIT_ALREADY_IN_OTHER_REPO',
  NORMAL_UNIT_FOLDER_ALREADY_USED = 'NORMAL_UNIT_FOLDER_ALREADY_USED',
  NORMAL_UNIT_CANNOT_DELETE = 'NORMAL_UNIT_FOLDER_CANNOT_DELETE',
  NORMAL_UNIT_CANNOT_EDIT_FOLDER = 'NORMAL_UNIT_CANNOT_EDIT_FOLDER',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

// ===== BUCKET-BASED INTERFACES (NEW NAMING) =====
// These provide the new bucket terminology while maintaining backwards compatibility

// Simple aliases where no property renaming is needed
export interface CreateBucketRequest extends CreateUnitRequest {}
export interface UpdateBucketRequest extends UpdateUnitRequest {}
export interface ValidateBucketRequest extends ValidateUnitRequest {}
export interface ValidateBucketResponse extends ValidateUnitResponse {}
export interface StorageBucket extends StorageUnit {}

export interface GetBucketsResponse {
  success: boolean;
  buckets: StorageBucket[];
}

// New interfaces where properties need renaming
export interface CreateBucketResponse {
  success: boolean;
  bucketId: string;
}

export interface UpdateBucketResponse extends CreateBucketResponse {
  status?: string;
  latency_ms?: number;
}

export interface RepoBucketInfo {
  folder: string;
  master: boolean;
  bucketId?: string;
  bucket?: StorageBucket;
}

export interface CreateRepoWithBucketsRequest {
  name: string;
  storageType: StorageType;
  mode: ModeType;
  repoBuckets: RepoBucketInfo[];
}

export interface UpdateRepoWithBucketsRequest extends CreateRepoWithBucketsRequest {}

export interface StorageRepoWithBuckets {
  id: string;
  name: string;
  storageType: StorageType;
  mode: ModeType;
  buckets: RepoBucketInfo[];
  apiKeys?: ApiKey[];
  createdAt: string;
  disabled?: boolean;
}

export interface ValidateRepoBucketsRequest {
  repoId: string;
  mode: ModeType;
  repoBuckets: RepoBucketInfo[];
}

export interface ValidateRepoBucketsResponse {
  success: boolean;
  error_code?: RepoErrorCodes;
  error_message?: string;
}

export interface StorageBucketStatusResponse {
  bucketId: string;
  nodeStatus: NodeStatusInfo[];
}

export interface GetBucketNodeStatsRequest {
  day: Date;
}

export interface GetBucketNodeStatsResponse {
  success: boolean;
  nodeStats: BucketNodeStatsDailyInfo[];
}

export interface BucketNodeStatsDailyInfo {
  ip: string;
  host: string;
  perc_uptime: number;
  avg_latency_ms: number;
  version: string;
  node_status: NodeStatusType;
  last_updated: string;
  last_latency_ms: number;
}
