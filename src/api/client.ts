import {
  CreateRepoRequest,
  CreateRepoResponse,
  CreateRepoKeyRequest,
  CreateRepoKeyResponse,
  GetReposResponse,
  GetRepoKeysResponse,
  ActionResponse,
  UpdateRepoRequest,
  UpdateRepoResponse,
  UpdateRepoKeyRequest,
  UpdateRepoKeyResponse,
  ValidateRepoUnitsRequest,
  ValidateRepoUnitsResponse,
  // Bucket-based interfaces
  CreateBucketRequest,
  CreateBucketResponse,
  UpdateBucketRequest,
  UpdateBucketResponse,
  ValidateBucketRequest,
  ValidateBucketResponse,
  StorageBucket,
  GetBucketsResponse,
  StorageBucketStatusResponse,
  GetBucketNodeStatsRequest,
  GetBucketNodeStatsResponse,
  // Bucket-based repo interfaces
  CreateRepoWithBucketsRequest,
  UpdateRepoWithBucketsRequest,
  ValidateRepoBucketsRequest,
  ValidateRepoBucketsResponse,
} from './types/storage';
import { IApiClient, ProviderType } from './interfaces';
import {
  ActivateResponse,
  DeactivateResponse,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  OAuth2ResponseDTO,
  RefreshTokenErrorResponse,
  RefreshTokenResponse,
  RegisterBody,
  RegisterResponse,
  ResetPasswordBody,
  Web3RegisterBody,
} from './types/auth';
import {
  StatsQueryParams,
  StatsResponse,
  NodeStatsMinuteResponse,
  NodeStatsDailyResponse,
  NodeStatsQueryParams,
  NodeStatsMinuteData,
  UnitStatsResponse,
  RepoStatsResponse,
  NodeStatsDailyQueryParams,
  BucketStatsResponse,
  // Bucket-based stats interfaces
  StatsQueryWithBucketParams,
  NodeStatsQueryWithBucketParams,
  NodeStatsDailyQueryWithBucketParams,
} from './types/stats';
import { NodeInfo, NodeInfoResponse, RegisterRequest } from './types/bridge';
import { GetOrganizationKeysResponse } from './types/noderegistration';
import { FeedbackEmailBody } from './types/email';
import { QuotaResponse } from './types/quota';
import {
  DeviceListResponse,
  DeviceDetailsResponse,
  SessionListResponse,
  TrustDeviceRequest,
  TrustDeviceResponse,
  UntrustDeviceResponse,
  RemoveDeviceResponse,
  RevokeSessionResponse,
  RevokeAllSessionsResponse,
  SessionHeartbeatResponse,
  DeviceInfo,
} from './types/device';
import {
  BuySubscriptionRequest,
  BuySubscriptionResponse,
  GetSubscriptionsResponse,
  MySubscriptionResponse,
  PaymentsListResponse,
  PaymentsQueryParams,
  CancelSubscriptionResponse,
  GetCheckoutSessionStatusResponse,
  CreateBillingPortalResponse,
  GetPendingPaymentResponse,
  CancelPendingPaymentResponse,
} from './types/subscriptions';
import { AuthTypes, WorkspaceTypes } from '.';
import { MFAMethodsResponse, 
  MFASetupRequest, 
  MFASetupResponse, 
  MFAStatusResponse, 
  MFAVerificationSetupRequest, 
  MFAVerificationSetupResponse, 
  MFAEnableRequest, 
  MFAEnableResponse, 
  MFADisableResponse, 
  MFAPrimaryRequest, 
  MFAPrimaryResponse, 
  MFAResetResponse, 
  MFAOrganizationEnforceRequest, 
  MFAOrganizationEnforceResponse, 
  MagicLinkActivationRequest,
  MagicLinkActivationResponse,
  MagicLinkSendResponse, 
  PasskeyAuthOptionsResult, 
  PasskeyCompleteRegistrationRequest, 
  PasskeyCompleteRegistrationResponse, 
  MFAVerificationRequest,
  MFAVerificationResult,
  MFAVerificationLoginResponse,
  MFAResetRequest
} from './types/mfa';
import { DeleteSettingsRequest, GetSettingsResponse, PartialUpdateSettingsRequest, UpdateSettingsRequest } from './types/settings';
import { UpdateUserRoleResponse, UserRoleResponse } from './types/roles';
import { UserProfileResponse } from './types/roles';
import { CreateOrgUserRequest, CreateOrgUserResponse, DeleteOrgUserResponse, GetOrganizationResponse, ListOrgUsersResponse, OrgUserResponse, UpdateOrganizationBody, UpdateOrganizationResponse, UpdateOrgUserRequest, UpdateOrgUserResponse } from './types/organization';
import { SystemEventQueryRequest, SystemEventQueryResponse } from './types/systemEvent';
import { UserUpdateRequest, UserUpdateResponse } from './types/user';

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: ErrorResponse
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError'; // This helps in instanceof checks
  }
}

export class ApiClient implements IApiClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private debug: boolean;

  constructor(baseURL: string = 'https://api.flashback.tech') {
    this.baseURL = baseURL;
    this.headers = {};
    this.debug = false;
  }

  public setDebug = (debug: boolean) => {
    this.debug = debug;
  };

  public setAuthToken = (token: string | null) => {
    if (token) {
      this.headers = {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  };

  public authenticate = async (token: string, provider: ProviderType, deviceInfo?: DeviceInfo): Promise<any> => {
    this.setAuthToken(token);
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.authenticateGoogle({ token, deviceInfo });
      case ProviderType.GITHUB:
        return this.authenticateGithub({ code: token, deviceInfo });
      case ProviderType.WEB3_STELLAR:
        throw new Error('Call web3Authenticate for web3 authentication');
      case ProviderType.LOCAL:
        throw new Error('Call userLogin for local authentication');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  public exchangeCode = async (
    code: string,
    provider: ProviderType
  ): Promise<OAuth2ResponseDTO> => {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.exchangeGoogleCode(code);
      case ProviderType.GITHUB:
        return this.exchangeGithubCode(code);
      case ProviderType.WEB3_STELLAR:
        return this.exchangeWeb3StellarCode(code);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  private exchangeGithubCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    throw new Error('Not implemented');
  };

  private exchangeWeb3StellarCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    throw new Error('Not implemented');
  };

  /**
   * Refresh the token for the given provider
   * @param refreshToken - The refresh token to use
   * @param provider - The provider to refresh the token for
   * @returns The refreshed token
   */
  public refreshToken = async (
    refreshToken: string,
    provider: ProviderType
  ): Promise<RefreshTokenResponse | RefreshTokenErrorResponse> => {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.refreshGoogleToken(refreshToken);
      case ProviderType.GITHUB:
        return this.refreshGithubToken(refreshToken);
      case ProviderType.LOCAL:
      case ProviderType.WEB3_STELLAR:
        return this.userRefresh(refreshToken);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  private makeRequest = async <T>(path: string, method: string, data?: any): Promise<T> => {
    const isFormData = data instanceof FormData;
    
    const options: RequestInit = {
      method,
      headers: this.headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : null,
    };
    
    if (data && !isFormData) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (this.debug) {
      console.log(`DEBUG: ${method} ${cleanPath} ${JSON.stringify(data)}`);
      console.log(`DEBUG: ${JSON.stringify(this.headers)}`);
    }
    const response = await fetch(`${this.baseURL}/${cleanPath}`, options);
    if (this.debug) {
      console.log(`DEBUG: ${response.status} ${response.statusText}`);
    }

    // If response is not ok, handle it before trying to parse JSON
    if (!response.ok) {
      let errorData = null;

      // Only try to parse JSON if we have content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : null; // Parse if not empty
        } catch (e) {
          console.debug('Failed to parse error response:', e);
        }
      }

      throw new HttpError(response.status, response.statusText, errorData);
    }

    // For successful responses, parse JSON if we have content
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : (null as T);
    } catch (e) {
      console.error('Failed to parse success response:', e);
      throw new Error('Invalid JSON response from server');
    }
  };

  ////// Auth API
  private authenticateGoogle = async (data: AuthTypes.GoogleLoginRequest): Promise<any> => {
    this.setAuthToken(data.token);
    return this.makeRequest<any>('auth/google', 'POST', data);
  };

  private authenticateGithub = async (data: AuthTypes.GithubLoginRequest): Promise<any> => {
    this.setAuthToken(data.code);
    return this.makeRequest<any>('auth/github', 'POST', data);
  };

  /**
   * Authenticate with a web3 provider
   * @param data - The data to authenticate with
   * @returns The authentication response
   */
  public web3Authenticate = async (data: Web3RegisterBody): Promise<any> => {
    return this.makeRequest<any>('auth/web3', 'POST', data);
  };

  private refreshGoogleToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return this.makeRequest<RefreshTokenResponse>('auth/google/refresh', 'POST', {
      refresh_token: refreshToken,
    });
  };

  private refreshGithubToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return this.makeRequest<RefreshTokenResponse>('auth/github/refresh', 'POST', {
      refresh_token: refreshToken,
    });
  };

  private exchangeGoogleCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    return this.makeRequest<OAuth2ResponseDTO>('auth/google/exchange', 'POST', { code });
  };

  // Token Management
  public getTokens = async (): Promise<{ success: boolean; tokens: any[] }> => {
    return this.makeRequest<{ success: boolean; tokens: any[] }>('token', 'GET', null);
  };

  public revokeToken = async (tokenId: string): Promise<{ success: boolean }> => {
    return this.makeRequest<{ success: boolean }>(`token/${tokenId}`, 'DELETE', null);
  };

  ////// Buckets API (new bucket-based endpoints)
  public createStorageBucket = async (data: CreateBucketRequest): Promise<CreateBucketResponse> => {
    return this.makeRequest<CreateBucketResponse>('bucket', 'POST', data);
  };

  public getStorageBuckets = async (workspaceId?: string): Promise<GetBucketsResponse> => {
    return this.makeRequest<GetBucketsResponse>('bucket?', 'GET', null);
  };

  public validateStorageBucket = async (
    bucketId: string,
    data: ValidateBucketRequest
  ): Promise<ValidateBucketResponse> => {
    return this.makeRequest<ValidateBucketResponse>(`bucket/${bucketId}/validate`, 'POST', data);
  };

  public updateStorageBucket = async (
    bucketId: string,
    data: UpdateBucketRequest
  ): Promise<UpdateBucketResponse> => {
    return this.makeRequest<UpdateBucketResponse>(`bucket/${bucketId}`, 'PUT', data);
  };

  public deleteStorageBucket = async (bucketId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`bucket/${bucketId}`, 'DELETE', null);
  };

  public getAvailableStorageBuckets = async (): Promise<StorageBucket[]> => {
    return this.makeRequest<StorageBucket[]>('bucket/available', 'GET', null);
  };

  public getStorageBucketStatus = async (bucketId: string): Promise<StorageBucketStatusResponse> => {
    return this.makeRequest<StorageBucketStatusResponse>(`bucket/${bucketId}/status`, 'GET', null);
  };

  public getBucketNodeStats = async (
    bucketId: string,
    data: GetBucketNodeStatsRequest
  ): Promise<GetBucketNodeStatsResponse> => {
    return this.makeRequest<GetBucketNodeStatsResponse>(`bucket/${bucketId}/stats`, 'POST', data);
  };

  ////// Repos API
  // Function overloads for createStorageRepo
  public createStorageRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>;
  public createStorageRepo(data: CreateRepoWithBucketsRequest): Promise<CreateRepoResponse>;
  public async createStorageRepo(data: CreateRepoRequest | CreateRepoWithBucketsRequest): Promise<CreateRepoResponse> {
    return this.makeRequest<CreateRepoResponse>('repo', 'POST', data);
  }

  public getStorageRepos = async (workspaceId?: string): Promise<GetReposResponse> => {
    return this.makeRequest<GetReposResponse>('repo?workspaceId=' + workspaceId, 'GET', null);
  };

  // Function overloads for updateStorageRepo
  public updateStorageRepo(repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse>;
  public updateStorageRepo(repoId: string, data: UpdateRepoWithBucketsRequest): Promise<UpdateRepoResponse>;
  public async updateStorageRepo(
    repoId: string,
    data: UpdateRepoRequest | UpdateRepoWithBucketsRequest
  ): Promise<UpdateRepoResponse> {
    return this.makeRequest<UpdateRepoResponse>(`repo/${repoId}`, 'PUT', data);
  }

  public deleteStorageRepo = async (repoId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}`, 'DELETE', null);
  };

  // Function overloads for validateNewRepoUnits
  public validateNewRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>;
  public validateNewRepoUnits(data: ValidateRepoBucketsRequest): Promise<ValidateRepoBucketsResponse>;
  public async validateNewRepoUnits(
    data: ValidateRepoUnitsRequest | ValidateRepoBucketsRequest
  ): Promise<ValidateRepoUnitsResponse | ValidateRepoBucketsResponse> {
    return this.makeRequest<ValidateRepoUnitsResponse | ValidateRepoBucketsResponse>('repo/validate', 'POST', data);
  }

  // Function overloads for validateUpdateRepoUnits
  public validateUpdateRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>;
  public validateUpdateRepoUnits(data: ValidateRepoBucketsRequest): Promise<ValidateRepoBucketsResponse>;
  public async validateUpdateRepoUnits(
    data: ValidateRepoUnitsRequest | ValidateRepoBucketsRequest
  ): Promise<ValidateRepoUnitsResponse | ValidateRepoBucketsResponse> {
    return this.makeRequest<ValidateRepoUnitsResponse | ValidateRepoBucketsResponse>(
      `repo/${data.repoId}/validate`,
      'POST',
      data
    );
  }

  ////// Keys API
  public createRepoKey = async (data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse> => {
    return this.makeRequest<CreateRepoKeyResponse>(`repo/${data.repoId}/apikey`, 'POST', data);
  };

  public getRepoKeys = async (repoId: string): Promise<GetRepoKeysResponse> => {
    return this.makeRequest<GetRepoKeysResponse>(`repo/${repoId}/apikey`, 'GET', null);
  };

  public updateRepoKey = async (
    repoId: string,
    keyId: string,
    data: UpdateRepoKeyRequest
  ): Promise<UpdateRepoKeyResponse> => {
    return this.makeRequest<UpdateRepoKeyResponse>(`repo/${repoId}/apikey/${keyId}`, 'PUT', data);
  };

  public deleteRepoKey = async (repoId: string, keyId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}/apikey/${keyId}`, 'DELETE', null);
  };

  ////// User API
  public userRegister = async (data: RegisterBody): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('user/register', 'POST', data);
  };

  public validateRegistration = async (token: string): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('/user/verify-email', 'POST', { token });
  };

  public userLogin = async (data: LoginBody): Promise<LoginResponse> => {
    return this.makeRequest<LoginResponse>('user/login', 'POST', data);
  };

  public userRefresh = async (
    refreshToken: string
  ): Promise<RefreshTokenResponse | RefreshTokenErrorResponse> => {
    return this.makeRequest<RefreshTokenResponse | RefreshTokenErrorResponse>(
      'user/refresh',
      'POST',
      { refresh_token: refreshToken }
    );
  };

  public userLogout = async (refreshToken: string): Promise<LogoutResponse> => {
    return this.makeRequest<LogoutResponse>('user/logout', 'POST', { refresh_token: refreshToken });
  };

  public userActivate = async (): Promise<ActivateResponse> => {
    return this.makeRequest<ActivateResponse>('user/activate', 'POST', null);
  };

  public userDeactivate = async (): Promise<DeactivateResponse> => {
    return this.makeRequest<DeactivateResponse>('user/deactivate', 'POST', null);
  };

  public getUserQuota = async (): Promise<QuotaResponse> => {
    return this.makeRequest<QuotaResponse>('user/quota', 'GET', null);
  };

  public updateUser = async (userId: string, data: UserUpdateRequest): Promise<UserUpdateResponse> => {
    return this.makeRequest<UserUpdateResponse>(`user/${userId}`, 'PUT', data);
  };

  public requestPasswordReset = async (email: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>('user/request-reset-password', 'POST', { email });
  };

  public resetPassword = async (data: ResetPasswordBody): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>('user/reset-password', 'POST', data);
  };

  ////// Stats API
  private validateDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate) {
      if (startDate > endDate) {
        throw new Error('startDate cannot be greater than endDate');
      }
    }
  }

  // Function overloads for getDailyStats
  public getDailyStats(params: StatsQueryParams): Promise<StatsResponse>;
  public getDailyStats(params: StatsQueryWithBucketParams): Promise<StatsResponse>;
  public async getDailyStats(params: StatsQueryParams | StatsQueryWithBucketParams): Promise<StatsResponse> {
    this.validateDateRange(params.startDate, params.endDate);

    const queryParams = new URLSearchParams();

    if (params.startDate) {
      queryParams.append('startDate', params.startDate.toISOString());
    }

    if (params.endDate) {
      queryParams.append('endDate', params.endDate.toISOString());
    }

    if (params.repoId && params.repoId.length > 0)
      queryParams.append('repoId', params.repoId.join(','));
    
    // Handle both unitId and bucketId
    if ('unitId' in params && params.unitId && params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
    } else if ('bucketId' in params && params.bucketId && params.bucketId.length > 0) {
      queryParams.append('bucketId', params.bucketId.join(','));
    }

    if (params.hosts && params.hosts.length > 0) {
      queryParams.append('hosts', params.hosts.join(','));
    }

    return this.makeRequest<StatsResponse>(`stats/daily?${queryParams.toString()}`, 'GET', null);
  }

  // Function overloads for getMinuteStats
  public getMinuteStats(params: StatsQueryParams): Promise<StatsResponse>;
  public getMinuteStats(params: StatsQueryWithBucketParams): Promise<StatsResponse>;
  public async getMinuteStats(params: StatsQueryParams | StatsQueryWithBucketParams): Promise<StatsResponse> {
    this.validateDateRange(params.startDate, params.endDate);

    const queryParams = new URLSearchParams();

    if (params.startDate) {
      queryParams.append('startDate', params.startDate.toISOString());
    }

    if (params.endDate) {
      queryParams.append('endDate', params.endDate.toISOString());
    }

    if (params.repoId && params.repoId.length > 0)
      queryParams.append('repoId', params.repoId.join(','));
    
    // Handle both unitId and bucketId
    if ('unitId' in params && params.unitId && params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
    } else if ('bucketId' in params && params.bucketId && params.bucketId.length > 0) {
      queryParams.append('bucketId', params.bucketId.join(','));
    }

    if (params.hosts && params.hosts.length > 0) {
      queryParams.append('hosts', params.hosts.join(','));
    }

    return this.makeRequest<StatsResponse>(`stats/minute?${queryParams.toString()}`, 'GET', null);
  }

  // Function overloads for getNodeStatsMinute
  public getNodeStatsMinute(params: NodeStatsQueryParams): Promise<NodeStatsMinuteResponse>;
  public getNodeStatsMinute(params: NodeStatsQueryWithBucketParams): Promise<NodeStatsMinuteResponse>;
  public async getNodeStatsMinute(
    params: NodeStatsQueryParams | NodeStatsQueryWithBucketParams
  ): Promise<NodeStatsMinuteResponse> {
    const queryParams = new URLSearchParams();
    
    // Handle both unitId and bucketId
    if ('unitId' in params && params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
    } else if ('bucketId' in params && params.bucketId.length > 0) {
      queryParams.append('bucketId', params.bucketId.join(','));
    }

    type ServerResponse = Omit<NodeStatsMinuteResponse, 'data'> & {
      data: Array<Omit<NodeStatsMinuteData, 'lastUpdated'> & { lastUpdated: string }>;
    };

    const response = await this.makeRequest<ServerResponse>(
      `stats/nodes/minute${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );

    // Process the response to convert lastUpdated strings to Date objects
    const processedData: NodeStatsMinuteData[] = response.data.map((item) => ({
      ...item,
      lastUpdated: new Date(item.lastUpdated),
    }));

    return {
      ...response,
      data: processedData,
    };
  }

  // Function overloads for getNodeStatsDaily
  public getNodeStatsDaily(params: NodeStatsDailyQueryParams): Promise<NodeStatsDailyResponse>;
  public getNodeStatsDaily(params: NodeStatsDailyQueryWithBucketParams): Promise<NodeStatsDailyResponse>;
  public async getNodeStatsDaily(
    params: NodeStatsDailyQueryParams | NodeStatsDailyQueryWithBucketParams
  ): Promise<NodeStatsDailyResponse> {
    const queryParams = new URLSearchParams();
    
    // Handle both unitId and bucketId
    if ('unitId' in params && params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
    } else if ('bucketId' in params && params.bucketId.length > 0) {
      queryParams.append('bucketId', params.bucketId.join(','));
    }
    
    if (params.startDate) {
      queryParams.append('startDate', params.startDate.toString());
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate.toString());
    }
    return this.makeRequest<NodeStatsDailyResponse>(
      `stats/nodes/daily${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  }

  public getRepoStats = async (params?: { repoId?: string[] }): Promise<RepoStatsResponse> => {
    const queryParams = new URLSearchParams();
    if (params && params.repoId && params.repoId.length > 0) {
      queryParams.append('repoId', params.repoId.join(','));
    }
    return this.makeRequest<RepoStatsResponse>(
      `repo/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public getUnitStats = async (params?: { unitId?: string[] }): Promise<UnitStatsResponse> => {
    const queryParams = new URLSearchParams();
    if (params && params.unitId && params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
    }
    return this.makeRequest<UnitStatsResponse>(
      `unit/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public getBucketStats = async (params?: { bucketId?: string[] }): Promise<BucketStatsResponse> => {
    const queryParams = new URLSearchParams();
    if (params && params.bucketId && params.bucketId.length > 0) {
      queryParams.append('bucketId', params.bucketId.join(','));
    }
    return this.makeRequest<BucketStatsResponse>(
      `bucket/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public getNodeInfo = async (): Promise<NodeInfoResponse> => {
    return this.makeRequest<NodeInfoResponse>('node', 'GET', null);
  };

  public getPrivateNodeInfo = async (orgId: string): Promise<NodeInfoResponse> => {
    return this.makeRequest<NodeInfoResponse>(`organization/${orgId}/nodes`, 'GET', null);
  };

  public deletePrivateNode = async (orgId: string, nodeId: string): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(`organization/${orgId}/node/${nodeId}`, 'DELETE', null);
  };

  public sendFeedbackEmail = async (data: FormData): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>('email/feedback', 'POST', data);
  };

  ////// Subscriptions API
  public getSubscriptions = async (): Promise<GetSubscriptionsResponse> => {
    return this.makeRequest<GetSubscriptionsResponse>('subscriptions', 'GET', null);
  };

  public getMySubscription = async (): Promise<MySubscriptionResponse> => {
    return this.makeRequest<MySubscriptionResponse>('subscriptions/my', 'GET', null);
  };

  public buySubscription = async (data: BuySubscriptionRequest): Promise<BuySubscriptionResponse> => {
    return this.makeRequest<BuySubscriptionResponse>('subscriptions/buy', 'POST', data);
  };

  public getPayments = async (params?: PaymentsQueryParams): Promise<PaymentsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    return this.makeRequest<PaymentsListResponse>(
      `subscriptions/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
    return this.makeRequest<CancelSubscriptionResponse>('subscriptions/cancel', 'POST', null);
  };

  public createBillingPortal = async (): Promise<CreateBillingPortalResponse> => {
    return this.makeRequest<CreateBillingPortalResponse>('subscriptions/portal', 'POST', null);
  };
  
  public getCheckoutSessionStatus = async (id: string): Promise<GetCheckoutSessionStatusResponse> => {
    return this.makeRequest<GetCheckoutSessionStatusResponse>(`subscriptions/checkout-session/${id}`, 'GET', null);
  };

  public getPendingPayment = async (): Promise<GetPendingPaymentResponse> => {
    return this.makeRequest<GetPendingPaymentResponse>('subscriptions/pending-payment', 'GET', null);
  };
  
  public cancelPendingPayment = async (): Promise<CancelPendingPaymentResponse> => {
    return this.makeRequest<CancelPendingPaymentResponse>('subscriptions/pending-payment', 'DELETE', null);
  };

  ////// Device Management API
  public getDevices = async (): Promise<DeviceListResponse> => {
    return this.makeRequest<DeviceListResponse>('devices', 'GET', null);
  };

  public getDeviceDetails = async (deviceId: string): Promise<DeviceDetailsResponse> => {
    return this.makeRequest<DeviceDetailsResponse>(`devices/${deviceId}`, 'GET', null);
  };

  public trustDevice = async (data: TrustDeviceRequest): Promise<TrustDeviceResponse> => {
    return this.makeRequest<TrustDeviceResponse>('devices/trust', 'POST', data);
  };

  public untrustDevice = async (deviceId: string): Promise<UntrustDeviceResponse> => {
    return this.makeRequest<UntrustDeviceResponse>(`devices/${deviceId}/untrust`, 'POST', null);
  };

  public removeDevice = async (deviceId: string): Promise<RemoveDeviceResponse> => {
    return this.makeRequest<RemoveDeviceResponse>(`devices/${deviceId}`, 'DELETE', null);
  };

  ////// Session Management API
  public getSessions = async (): Promise<SessionListResponse> => {
    return this.makeRequest<SessionListResponse>('sessions', 'GET', null);
  };

  public revokeSession = async (sessionId: string): Promise<RevokeSessionResponse> => {
    return this.makeRequest<RevokeSessionResponse>(`sessions/${sessionId}/revoke`, 'POST', null);
  };

  public revokeAllSessions = async (): Promise<RevokeAllSessionsResponse> => {
    return this.makeRequest<RevokeAllSessionsResponse>('sessions/revoke-all', 'POST', null);
  };

  public updateSessionHeartbeat = async (sessionId: string): Promise<SessionHeartbeatResponse> => {
    return this.makeRequest<SessionHeartbeatResponse>(`sessions/${sessionId}/heartbeat`, 'POST', null);
  };

  ////// MFA Status & Methods API
  public getMFAStatus = async (): Promise<MFAStatusResponse> => {
    return this.makeRequest<MFAStatusResponse>('mfa/status', 'GET', null);
  };

  public getAvailableMethods = async (): Promise<MFAMethodsResponse> => {
    return this.makeRequest<MFAMethodsResponse>('mfa/methods', 'GET', null);
  };

  ////// MFA Setup & Verification API
  public setupMFA = async (request: MFASetupRequest): Promise<MFASetupResponse> => {
    return this.makeRequest<MFASetupResponse>('mfa/setup', 'POST', request);
  };

  public verifyMFASetup = async (request: MFAVerificationSetupRequest): Promise<MFAVerificationSetupResponse> => {
    return this.makeRequest<MFAVerificationSetupResponse>('mfa/verify-setup', 'POST', request);
  };

  public verifyMFALogin = async (request: MFAVerificationRequest): Promise<MFAVerificationLoginResponse> => {
    return this.makeRequest<MFAVerificationLoginResponse>('mfa/verify-login', 'POST', request);
  };
  ////// MFA Management API
  public enableMFA = async (request: MFAEnableRequest): Promise<MFAEnableResponse> => {
    return this.makeRequest<MFAEnableResponse>('mfa/enable', 'POST', request);
  };

  public disableMFA = async (request: MFAEnableRequest): Promise<MFADisableResponse> => {
    return this.makeRequest<MFADisableResponse>('mfa/disable', 'POST', request);
  };

  public setPrimaryMFA = async (request: MFAPrimaryRequest): Promise<MFAPrimaryResponse> => {
    return this.makeRequest<MFAPrimaryResponse>('mfa/primary', 'POST', request);
  };

  public resetMFA = async (request: MFAResetRequest): Promise<MFAResetResponse> => {
    return this.makeRequest<MFAResetResponse>('mfa/reset', 'POST', request);
  };

  ////// Organization MFA API
  public enforceOrganizationMFA = async (request: MFAOrganizationEnforceRequest): Promise<MFAOrganizationEnforceResponse> => {
    return this.makeRequest<MFAOrganizationEnforceResponse>('mfa/organization/enforce', 'POST', request);
  };

  ////// Magic Link MFA API
  public sendMagicLink = async (): Promise<MagicLinkSendResponse> => {
    return this.makeRequest<MagicLinkSendResponse>('mfa/magic-link/send', 'POST', null);
  };

  public activateMagicLink = async (data: MagicLinkActivationRequest): Promise<MagicLinkActivationResponse> => {
    return this.makeRequest<MagicLinkActivationResponse>('mfa/magic-link/activate', 'POST', data);
  };

  ////// Passkey MFA API
  public getPasskeyAuthOptions = async (): Promise<PasskeyAuthOptionsResult> => {
    return this.makeRequest<PasskeyAuthOptionsResult>('mfa/passkey/auth-options', 'POST', null);
  };

  public completePasskeyRegistration = async (request: PasskeyCompleteRegistrationRequest): Promise<PasskeyCompleteRegistrationResponse> => {
    return this.makeRequest<PasskeyCompleteRegistrationResponse>('mfa/passkey/complete-registration', 'POST', request);
  };

  public getUserSettings = async (): Promise<GetSettingsResponse> => {
    return this.makeRequest<GetSettingsResponse>('settings/user', 'GET');
  };
  
  public updateUserSettings = async (request: UpdateSettingsRequest): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/user', 'POST', request);
  };
  
  public partialUpdateUserSettings = async (request: PartialUpdateSettingsRequest): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/user', 'PUT', request);
  };
  
  public deleteUserSettingsKeys = async (request: DeleteSettingsRequest): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/user', 'DELETE', request);
  };
  
  // Organization Settings Methods
  public getOrganizationSettings = async (): Promise<GetSettingsResponse> => {
    return this.makeRequest<GetSettingsResponse>('settings/organization', 'GET');
  };
  
  public updateOrganizationSettings = async (request: UpdateSettingsRequest): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/organization', 'POST', request);
  };
  
  public partialUpdateOrganizationSettings = async (request: PartialUpdateSettingsRequest): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/organization', 'PUT', request);
  };
  
  public deleteOrganizationSettingsKeys = async (request: DeleteSettingsRequest): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/organization', 'DELETE', request);
  };

  // Role/profile management methods
  public getUserProfile = async (): Promise<UserProfileResponse> => {
    return this.makeRequest<UserProfileResponse>('user/profile', 'GET', null);
  };
  
  public getUserById = async (userId: string): Promise<UserRoleResponse> => {
    return this.makeRequest<UserRoleResponse>(`user/${userId}`, 'GET', null);
  };
  
  public updateUserRole = async (userId: string, orgRole: number): Promise<UpdateUserRoleResponse> => {
    return this.makeRequest<UpdateUserRoleResponse>(`user/${userId}/role`, 'PUT', { orgRole });
  };

  ////// Workspace Management API
  public createWorkspace = async (request: WorkspaceTypes.CreateWorkspaceRequest): Promise<WorkspaceTypes.CreateWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.CreateWorkspaceResponse>('workspace', 'POST', request);
  };

  public getWorkspaces = async (): Promise<WorkspaceTypes.GetWorkspacesResponse> => {
    return this.makeRequest<WorkspaceTypes.GetWorkspacesResponse>('workspace', 'GET', null);
  };

  public getWorkspace = async (id: string): Promise<WorkspaceTypes.GetWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.GetWorkspaceResponse>(`workspace/${id}`, 'GET', null);
  };

  public updateWorkspace = async (id: string, request: WorkspaceTypes.UpdateWorkspaceRequest): Promise<WorkspaceTypes.UpdateWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.UpdateWorkspaceResponse>(`workspace/${id}`, 'PUT', request);
  };

  public deleteWorkspace = async (id: string): Promise<WorkspaceTypes.DeleteWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.DeleteWorkspaceResponse>(`workspace/${id}`, 'DELETE', null);
  };

  ////// Workspace User Management API
  public addUserToWorkspace = async (workspaceId: string, request: WorkspaceTypes.AddUserToWorkspaceRequest): Promise<WorkspaceTypes.AddUserToWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.AddUserToWorkspaceResponse>(`workspace/${workspaceId}/users`, 'POST', request);
  };

  public updateWorkspaceUserRole = async (workspaceId: string, userId: string, request: WorkspaceTypes.UpdateUserRoleRequest): Promise<WorkspaceTypes.UpdateUserRoleResponse> => {
    return this.makeRequest<WorkspaceTypes.UpdateUserRoleResponse>(`workspace/${workspaceId}/users/${userId}`, 'PUT', request);
  };

  public removeUserFromWorkspace = async (workspaceId: string, userId: string): Promise<WorkspaceTypes.RemoveUserFromWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.RemoveUserFromWorkspaceResponse>(`workspace/${workspaceId}/users/${userId}`, 'DELETE', null);
  };

  // Organization Users Management
  public getOrganizationUsers = async (): Promise<ListOrgUsersResponse> => {
    return this.makeRequest<ListOrgUsersResponse>('organization/users', 'GET', null);
  };

  public createOrganizationUser = async (request: CreateOrgUserRequest): Promise<CreateOrgUserResponse> => {
    return this.makeRequest<CreateOrgUserResponse>('organization/users', 'POST', request);
  };

  public getOrganizationUser = async (userId: string): Promise<OrgUserResponse | { success: false; message: string }> => {
    return this.makeRequest<OrgUserResponse | { success: false; message: string }>(`organization/users/${userId}`, 'GET', null);
  };

  public updateOrganizationUser = async (userId: string, request: UpdateOrgUserRequest): Promise<UpdateOrgUserResponse> => {
    return this.makeRequest<UpdateOrgUserResponse>(`organization/users/${userId}`, 'PUT', request);
  };

  public deleteOrganizationUser = async (userId: string): Promise<DeleteOrgUserResponse> => {
    return this.makeRequest<DeleteOrgUserResponse>(`organization/users/${userId}`, 'DELETE', null);
  };

  public activateOrganizationUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(`organization/users/${userId}/activate`, 'POST', null);
  };

  public getOrganization = async (orgId: string): Promise<GetOrganizationResponse> => {
    return this.makeRequest<GetOrganizationResponse>(`organization/${orgId}`, 'GET', null);
  };
  
  public updateOrganization = async (orgId: string, request: UpdateOrganizationBody): Promise<UpdateOrganizationResponse> => {
    return this.makeRequest<UpdateOrganizationResponse>(`organization/${orgId}`, 'PUT', request);
  };

  // Node registration methods
  // Organization Keys API calls
  public generateOrgKey = async (idOrg: string): Promise<string> => {
    return this.makeRequest<string>(`organization/${idOrg}/key`, 'POST');
  };

  public deleteOrgKeys = async (idOrg: string): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(`organization/${idOrg}/key`, 'DELETE');
  };

  public getOrgKeys = async (idOrg: string): Promise<GetOrganizationKeysResponse> => {
    return this.makeRequest<GetOrganizationKeysResponse>(`organization/${idOrg}/key`, 'GET');
  };

  public deleteOrgKey = async (idOrg: string, keyId: string): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(`organization/${idOrg}/key/${keyId}`, 'DELETE');
  };

  // Node Registration API calls
  public nodeRegister = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('register', 'POST', data);
  };

  public nodeUnregister = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('unregister', 'POST', data);
  };

  // System Event API calls
  public getSystemEvents = async (data: SystemEventQueryRequest): Promise<SystemEventQueryResponse> => {
    return this.makeRequest<SystemEventQueryResponse>('systemevent', 'POST', data);
  };

}
