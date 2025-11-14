import {
  StorageUnit,
  CreateUnitRequest,
  CreateUnitResponse,
  CreateRepoRequest,
  CreateRepoResponse,
  CreateRepoKeyRequest,
  CreateRepoKeyResponse,
  GetUnitsResponse,
  GetReposResponse,
  GetRepoKeysResponse,
  UpdateUnitRequest,
  UpdateUnitResponse,
  ActionResponse,
  UpdateRepoResponse,
  UpdateRepoRequest,
  UpdateRepoKeyRequest,
  UpdateRepoKeyResponse,
  ValidateUnitRequest,
  ValidateUnitResponse,
  ValidateRepoUnitsRequest,
  ValidateRepoUnitsResponse,
  GetUnitNodeStatsRequest,
  GetUnitNodeStatsResponse,
  GetBucketsResponse,
  CreateBucketRequest,
  CreateBucketResponse,
  UpdateBucketRequest,
  UpdateBucketResponse,
  ValidateBucketRequest,
  ValidateBucketResponse,
} from './types/storage/storage';
import {
  RegisterBody,
  LoginBody,
  RegisterResponse,
  LoginResponse,
  LogoutResponse,
  ActivateResponse,
  ActivateUserRequest,
  ActivateUserResponse,
  DeactivateResponse,
  RefreshTokenResponse,
  RefreshTokenErrorResponse,
} from './types/platform/auth';
import {
  StatsQueryParams,
  StatsResponse,
  NodeStatsMinuteResponse,
  NodeStatsDailyResponse,
  NodeStatsQueryParams,
} from './types/storage/stats';
import {
  BuySubscriptionRequest,
  BuySubscriptionResponse,
  GetSubscriptionsResponse,
  MySubscriptionResponse,
  PaymentsListResponse,
  PaymentsQueryParams,
  CancelSubscriptionResponse,
} from './types/platform/subscriptions';

export enum ProviderType {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  WEB3_STELLAR = 'WEB3_STELLAR',
  LOCAL = 'LOCAL',
}

export interface IApiClient {
  authenticate(token: string, provider: ProviderType): Promise<any>;
  getStorageBuckets(workspaceId?: string): Promise<GetBucketsResponse>;
  createStorageBucket(data: CreateBucketRequest): Promise<CreateBucketResponse>;
  updateStorageBucket(bucketId: string, data: UpdateBucketRequest): Promise<UpdateBucketResponse>;
  deleteStorageBucket(bucketId: string): Promise<ActionResponse>;
  validateStorageBucket(bucketId: string, data: ValidateBucketRequest): Promise<ValidateBucketResponse>;
  createStorageRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>;
  getStorageRepos(workspaceId?: string): Promise<GetReposResponse>;
  updateStorageRepo(repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse>;
  deleteStorageRepo(repoId: string): Promise<ActionResponse>;
  createRepoKey(data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse>;
  getRepoKeys(repoId: string): Promise<GetRepoKeysResponse>;
  updateRepoKey(
    repoId: string,
    keyId: string,
    data: UpdateRepoKeyRequest
  ): Promise<UpdateRepoKeyResponse>;
  deleteRepoKey(repoId: string, keyId: string): Promise<ActionResponse>;
  validateNewRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>;
  validateUpdateRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>;
  userRegister(registerBody: RegisterBody): Promise<RegisterResponse>;
  userLogin(loginBody: LoginBody): Promise<LoginResponse>;
  userRefresh(refreshToken: string): Promise<RefreshTokenResponse | RefreshTokenErrorResponse>;
  userLogout(refreshToken: string): Promise<LogoutResponse>;
  userActivate(data: ActivateUserRequest): Promise<ActivateUserResponse>;
  userDeactivate(): Promise<DeactivateResponse>;
  getDailyStats(params: StatsQueryParams): Promise<StatsResponse>;
  getMinuteStats(params: StatsQueryParams): Promise<StatsResponse>;
  getNodeStatsMinute(params?: NodeStatsQueryParams): Promise<NodeStatsMinuteResponse>;
  getNodeStatsDaily(params?: NodeStatsQueryParams): Promise<NodeStatsDailyResponse>;
  getSubscriptions(): Promise<GetSubscriptionsResponse>;
  getMySubscription(): Promise<MySubscriptionResponse>;
  buySubscription(data: BuySubscriptionRequest): Promise<BuySubscriptionResponse>;
  getPayments(params?: PaymentsQueryParams): Promise<PaymentsListResponse>;
  cancelSubscription(): Promise<CancelSubscriptionResponse>;
}
