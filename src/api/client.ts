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
  GetProviderApiKeysParams,
  GetProviderApiKeysResponse,
  CreateProviderApiKeyRequest,
  CreateProviderApiKeyResponse,
  UpdateProviderApiKeyRequest,
  UpdateProviderApiKeyResponse,
  DeleteProviderApiKeyResponse,
  // Bucket-based repo interfaces
  CreateRepoWithBucketsRequest,
  UpdateRepoWithBucketsRequest,
  ValidateRepoBucketsRequest,
  ValidateRepoBucketsResponse,
  GetRepoResponse,
  StorageRepoWithBuckets,
} from './types/storage/storage';
import {
  AddRepoCloudApiKeyRequest,
  AddRepoCloudApiKeyResponse,
  ListRepoCloudApiKeysResponse,
} from './types/platform/cloudkeys';
import {
  ApproveAgentPlanRequest,
  ApproveAgentPlanResponse,
  CreateAgentPlanRequest,
  CreateAgentPlanResponse,
  CreateAgentTemplateRequest,
  CreateAgentTemplateResponse,
  DeleteAgentSnippetResponse,
  DeleteAgentTemplateResponse,
  GetAgentPlanResponse,
  GetAgentSnippetResponse,
  GetAgentSnippetVersionResponse,
  GetAgentTemplateLogsResponse,
  GetAgentTemplateResponse,
  ListAgentPlansQuery,
  ListAgentPlansResponse,
  ListAgentSnippetVersionsResponse,
  ListAgentSnippetsQuery,
  ListAgentSnippetsResponse,
  ListAgentTemplatesQuery,
  ListAgentTemplatesResponse,
  ListAgentToolsResponse,
  RefreshAgentToolsResponse,
  RejectAgentPlanResponse,
  ListAgentTemplateLogsQuery,
  UpdateAgentSnippetRequest,
  UpdateAgentSnippetResponse,
  UpdateAgentTemplateRequest,
  UpdateAgentTemplateResponse,
  RefreshAgentTemplateBlueprintRequest,
  RefreshAgentTemplateBlueprintResponse,
} from './types/agentengine';
import { IApiClient, ProviderType } from './interfaces';
import {
  ActivateResponse,
  ActivateUserRequest,
  ActivateUserResponse,
  DeactivateResponse,
  DemoRequestBody,
  DemoRequestResponse,
  GoogleExchangeCodeRequest,
  MicrosoftExchangeCodeRequest,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  OAuth2ResponseDTO,
  RefreshTokenErrorResponse,
  RefreshTokenResponse,
  RegisterBody,
  RegisterResponse,
  ResendVerificationEmailResponse,
  ResetPasswordBody,
  Web3RegisterBody,
} from './types/platform/auth';
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
} from './types/storage/stats';
import { AiStatsQueryParams, AiStatsResponse } from './types/ai/stats';

import { NodeInfo, NodeInfoResponse, RegisterRequest, ServiceFlag } from './types/storage/bridge';
import { GetOrganizationKeysResponse } from './types/storage/noderegistration';
import { FeedbackEmailBody } from './types/platform/email';
import { QuotaResponse } from './types/platform/quota';
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
} from './types/platform/device';
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
} from './types/platform/subscriptions';
import { AuthTypes, WorkspaceTypes } from '.';
import {
  MFAMethodsResponse,
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
  MFAResetRequest,
} from './types/platform/mfa';
import {
  DeleteSettingsRequest,
  GetSettingsResponse,
  PartialUpdateSettingsRequest,
  UpdateSettingsRequest,
} from './types/platform/settings';
import { UpdateUserRoleResponse, UserRoleResponse } from './types/platform/roles';
import { UserProfileResponse } from './types/platform/roles';
import {
  CloudResourceDto,
  UpsertCloudResourcesRequest,
  UpsertCloudResourcesResponse,
  ListCloudResourcesQuery,
  ListCloudResourcesResponse,
} from './types/cloudresources';
import {
  CreateOrgUserRequest,
  CreateOrgUserResponse,
  DeleteOrgUserResponse,
  GetOrganizationResponse,
  ListOrgUsersResponse,
  OrgUserResponse,
  UpdateOrganizationBody,
  UpdateOrganizationResponse,
  UpdateOrgUserRequest,
  UpdateOrgUserResponse,
} from './types/platform/organization';
import {
  SystemEventQueryRequest,
  SystemEventQueryResponse,
  SystemEventReadIdsRequest,
  SystemEventReadStatusResponse,
} from './types/platform/systemevent';
import {
  PreVerifyEmailResponse,
  UserUpdateRequest,
  UserUpdateResponse,
} from './types/platform/user';
import {
  CreateRepoAiApiKeyRequest,
  CreateRepoAiApiKeyResponse,
  DeleteRepoAiApiKeyResponse,
  GetRepoAiApiKeysResponse,
  RepoAiApiKeyDTO,
  UpdateRepoAiApiKeyRequest,
  UpdateRepoAiApiKeyResponse,
} from './types/ai/aiapikey';
import {
  AiLlmStatsResponse,
  CreateAiLlmRequest,
  CreateAiLlmResponse,
  DeleteAiLlmResponse,
  GetAiLlmsResponse,
  UpdateAiLlmRequest,
  UpdateAiLlmResponse,
  ValidateAiLlmResponse,
  GetAiModelsRequest,
  GetAiModelsResponse,
} from './types/ai/aillm';
import {
  CreatePolicyRequest,
  GetPoliciesQuery,
  GetPolicyViolationsQuery,
  GetPolicyViolationsResponse,
  GetPolicyAlertsQuery,
  GetPolicyAlertsResponse,
  PolicyDTO,
  UpdatePolicyRequest,
  PolicyValidationRequest,
  PolicyValidationResponse,
  PolicyRecommendationRequest,
  PolicyRecommendationResponse,
} from './types/ai/policy';
import {
  CreateConversationRequest,
  CreateConversationResponse,
  SendPromptRequest,
  SendPromptResponse,
  GetConversationsRequest,
  GetConversationsResponse,
  GetConversationMessagesResponse,
  GetConversationMessagesRequest,
  DeleteConversationRequest,
  DeleteConversationResponse,
} from './types/ai/conversation';
import {
  GetLinksRequest,
  GetLinksResponse,
  CreateLinkRequest,
  CreateLinkResponse,
  UpdateLinkRequest,
  UpdateLinkResponse,
  DeleteLinkResponse,
  GetLinkByTokenResponse,
} from './types/platform/links';
import {
  GetCreditsBalanceResponse,
  GetCreditsTransactionsRequest,
  GetCreditsTransactionsResponse,
  GetCreditsConsumptionRequest,
  GetCreditsConsumptionResponse,
  BuyCreditsPackRequest,
  BuyCreditsPackResponse,
  GetCreditsPacksResponse,
  GetCreditsRatesResponse,
  GetCreditsMonthlyStatsRequest,
  GetCreditsMonthlyStatsResponse,
} from './types/platform/credits';
import {
  StorageStatsQueryParams as V2StorageStatsQueryParams,
  StorageTimeSeriesResponse,
  StorageBreakdownResponse,
  StorageProviderBreakdownResponse,
  StorageBreakdownBy,
  AiGatewayStatsQueryParams,
  AiGatewayTimeSeriesResponse,
  AiGatewayBreakdownResponse,
  AiBreakdownBy,
  PrivateChatStatsQueryParams,
  PrivateChatTimeSeriesResponse,
  PrivateChatModelBreakdownResponse,
  PrivateChatUsersBreakdownResponse,
  PolicyStatsQueryParams,
  PolicyTimeSeriesResponse,
  PolicyTokenTimeSeriesResponse,
  PolicyBreakdownResponse,
  PolicyBreakdownBy,
  CreditStatsQueryParams,
  CreditTimeSeriesResponse,
  CreditBreakdownResponse,
  CreditBreakdownBy,
  DashboardStatsQueryParams,
  DashboardBreakdownQueryParams,
} from './types/dashboard/stats';

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

  /** Proxied Agent Engine routes on the FlashBackend (`/api/agentengine/...`). */
  private agentEnginePath(subpath: string): string {
    const trimmed = subpath.startsWith('/') ? subpath.slice(1) : subpath;
    return `api/agentengine/${trimmed}`;
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

  public authenticate = async (
    token: string,
    provider: ProviderType,
    deviceInfo?: DeviceInfo,
    activationUid?: string,
    activationToken?: string
  ): Promise<any> => {
    this.setAuthToken(token);
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.authenticateGoogle({ token, deviceInfo });
      case ProviderType.GITHUB:
        return this.authenticateGithub({ code: token, deviceInfo, activationUid, activationToken });
      case ProviderType.MICROSOFT:
        return this.authenticateMicrosoft({ token, deviceInfo });
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
    provider: ProviderType,
    activationUid?: string,
    activationToken?: string
  ): Promise<OAuth2ResponseDTO> => {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.exchangeGoogleCode({ code, activationUid, activationToken });
      case ProviderType.GITHUB:
        return this.exchangeGithubCode(code);
      case ProviderType.MICROSOFT:
        return this.exchangeMicrosoftCode({ code, activationUid, activationToken });
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
      case ProviderType.MICROSOFT:
        return this.refreshMicrosoftToken(refreshToken);
      case ProviderType.LOCAL:
      case ProviderType.WEB3_STELLAR:
        return this.userRefresh(refreshToken);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  private makeRequest = async <T>(path: string, method: string, data?: any): Promise<T> => {
    const isFormData = data instanceof FormData;
    const isGetOrHead = method === 'GET' || method === 'HEAD';

    // GET/HEAD cannot have a body: serialize plain objects as query string
    let requestPath = path.startsWith('/') ? path.substring(1) : path;
    let body: RequestInit['body'] = null;

    if (data != null) {
      if (isGetOrHead && !isFormData && typeof data === 'object' && data.constructor === Object) {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(data)) {
          if (v !== undefined && v !== null) {
            params.set(k, String(v));
          }
        }
        const qs = params.toString();
        if (qs) {
          requestPath += (requestPath.includes('?') ? '&' : '?') + qs;
        }
      } else if (!isGetOrHead) {
        body = isFormData ? data : JSON.stringify(data);
      }
    }

    const options: RequestInit = {
      method,
      headers: this.headers,
      body,
    };

    if (body && !isFormData) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
    }
    const cleanPath = requestPath;
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

  private authenticateMicrosoft = async (data: AuthTypes.MicrosoftLoginRequest): Promise<any> => {
    this.setAuthToken(data.token);
    return this.makeRequest<any>('auth/microsoft', 'POST', data);
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

  private refreshMicrosoftToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return this.makeRequest<RefreshTokenResponse>('auth/microsoft/refresh', 'POST', {
      refresh_token: refreshToken,
    });
  };

  private exchangeGoogleCode = async (
    data: GoogleExchangeCodeRequest
  ): Promise<OAuth2ResponseDTO> => {
    return this.makeRequest<OAuth2ResponseDTO>('auth/google/exchange', 'POST', data);
  };

  private exchangeMicrosoftCode = async (
    data: MicrosoftExchangeCodeRequest
  ): Promise<OAuth2ResponseDTO> => {
    return this.makeRequest<OAuth2ResponseDTO>('auth/microsoft/exchange', 'POST', data);
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

  public getStorageBuckets = async (
    workspaceId?: string,
    walletAddress?: string
  ): Promise<GetBucketsResponse> => {
    return this.makeRequest<GetBucketsResponse>(
      'bucket?workspaceId=' + workspaceId + '&walletAddress=' + walletAddress,
      'GET',
      null
    );
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

  public getAvailableStorageBuckets = async (workspaceId?: string): Promise<StorageBucket[]> => {
    const queryParams = new URLSearchParams();
    if (workspaceId) {
      queryParams.append('workspaceId', workspaceId);
    }
    return this.makeRequest<StorageBucket[]>(
      'bucket/available?' + queryParams.toString(),
      'GET',
      null
    );
  };

  public getStorageBucketStatus = async (
    bucketId: string
  ): Promise<StorageBucketStatusResponse> => {
    return this.makeRequest<StorageBucketStatusResponse>(`bucket/${bucketId}/status`, 'GET', null);
  };

  public getBucketNodeStats = async (
    bucketId: string,
    data: GetBucketNodeStatsRequest
  ): Promise<GetBucketNodeStatsResponse> => {
    return this.makeRequest<GetBucketNodeStatsResponse>(`bucket/${bucketId}/stats`, 'POST', data);
  };

  public getApiKeys = async (
    params?: string | GetProviderApiKeysParams
  ): Promise<GetProviderApiKeysResponse> => {
    const queryParams = new URLSearchParams();
    if (params !== undefined) {
      if (typeof params === 'string') {
        queryParams.append('workspaceId', params);
      } else {
        if (params.workspaceId) queryParams.append('workspaceId', params.workspaceId);
        if (params.capability !== undefined)
          queryParams.append('capability', String(params.capability));
        if (params.provider) queryParams.append('provider', params.provider);
      }
    }
    return this.makeRequest<GetProviderApiKeysResponse>(
      'apikeys?' + queryParams.toString(),
      'GET',
      null
    );
  };

  public createApiKey = async (
    data: CreateProviderApiKeyRequest
  ): Promise<CreateProviderApiKeyResponse> => {
    return this.makeRequest<CreateProviderApiKeyResponse>('apikeys', 'POST', data);
  };

  public updateApiKey = async (
    apiKeyId: string,
    data: UpdateProviderApiKeyRequest
  ): Promise<UpdateProviderApiKeyResponse> => {
    return this.makeRequest<UpdateProviderApiKeyResponse>(`apikeys/${apiKeyId}`, 'PUT', data);
  };

  public deleteApiKey = async (apiKeyId: string): Promise<DeleteProviderApiKeyResponse> => {
    return this.makeRequest<DeleteProviderApiKeyResponse>(`apikeys/${apiKeyId}`, 'DELETE', null);
  };

  ////// Repos API
  // Function overloads for createStorageRepo
  public createStorageRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>;
  public createStorageRepo(data: CreateRepoWithBucketsRequest): Promise<CreateRepoResponse>;
  public async createStorageRepo(
    data: CreateRepoRequest | CreateRepoWithBucketsRequest
  ): Promise<CreateRepoResponse> {
    return this.makeRequest<CreateRepoResponse>('repo', 'POST', data);
  }

  public getStorageRepos = async (
    workspaceId?: string,
    walletAddress?: string,
    repoId?: string
  ): Promise<GetReposResponse> => {
    const queryParams = new URLSearchParams();
    if (workspaceId) {
      queryParams.append('workspaceId', workspaceId);
    }
    if (repoId) {
      queryParams.append('repoId', repoId);
    }
    if (walletAddress) {
      queryParams.append('walletAddress', walletAddress);
    }
    return this.makeRequest<GetReposResponse>('repo?' + queryParams.toString(), 'GET', null);
  };

  public getStorageRepo = async (repoId: string): Promise<GetRepoResponse> => {
    const response = await this.getStorageRepos(undefined, undefined, repoId);
    if (response.success && response.repos.length > 0) {
      return { success: true, repo: response.repos[0] as StorageRepoWithBuckets };
    }
    return { success: false, repo: {} as StorageRepoWithBuckets };
  };

  // Function overloads for updateStorageRepo
  public updateStorageRepo(repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse>;
  public updateStorageRepo(
    repoId: string,
    data: UpdateRepoWithBucketsRequest
  ): Promise<UpdateRepoResponse>;
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
  public validateNewRepoUnits(
    data: ValidateRepoBucketsRequest
  ): Promise<ValidateRepoBucketsResponse>;
  public async validateNewRepoUnits(
    data: ValidateRepoUnitsRequest | ValidateRepoBucketsRequest
  ): Promise<ValidateRepoUnitsResponse | ValidateRepoBucketsResponse> {
    return this.makeRequest<ValidateRepoUnitsResponse | ValidateRepoBucketsResponse>(
      'repo/validate',
      'POST',
      data
    );
  }

  // Function overloads for validateUpdateRepoUnits
  public validateUpdateRepoUnits(
    data: ValidateRepoUnitsRequest
  ): Promise<ValidateRepoUnitsResponse>;
  public validateUpdateRepoUnits(
    data: ValidateRepoBucketsRequest
  ): Promise<ValidateRepoBucketsResponse>;
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

  public addRepoCloudApiKey = async (
    data: AddRepoCloudApiKeyRequest
  ): Promise<AddRepoCloudApiKeyResponse> => {
    return this.makeRequest<AddRepoCloudApiKeyResponse>(
      `repo/${data.repoId}/cloud-apikey`,
      'POST',
      { apiKeyId: data.apiKeyId }
    );
  };

  public listRepoCloudApiKeys = async (repoId: string): Promise<ListRepoCloudApiKeysResponse> => {
    return this.makeRequest<ListRepoCloudApiKeysResponse>(
      `repo/${repoId}/cloud-apikey`,
      'GET',
      null
    );
  };

  public removeRepoCloudApiKey = async (
    repoId: string,
    repoCloudApiKeyId: string
  ): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(
      `repo/${repoId}/cloud-apikey/${repoCloudApiKeyId}`,
      'DELETE',
      null
    );
  };

  ////// Agent Engine API (backend proxy → FlashAgentEngine)
  public createAgentPlan = async (
    data: CreateAgentPlanRequest
  ): Promise<CreateAgentPlanResponse> => {
    return this.makeRequest<CreateAgentPlanResponse>(this.agentEnginePath('plan'), 'POST', data);
  };

  public getAgentPlan = async (flowId: string): Promise<GetAgentPlanResponse> => {
    return this.makeRequest<GetAgentPlanResponse>(
      this.agentEnginePath(`plan/${flowId}`),
      'GET',
      null
    );
  };

  public listAgentPlans = async (query: ListAgentPlansQuery): Promise<ListAgentPlansResponse> => {
    const params = new URLSearchParams();
    params.set('org_id', query.org_id);
    if (query.limit !== undefined) {
      params.set('limit', String(query.limit));
    }
    if (query.offset !== undefined) {
      params.set('offset', String(query.offset));
    }
    return this.makeRequest<ListAgentPlansResponse>(
      `${this.agentEnginePath('plans')}?${params.toString()}`,
      'GET',
      null
    );
  };

  public approveAgentPlan = async (
    flowId: string,
    data?: ApproveAgentPlanRequest
  ): Promise<ApproveAgentPlanResponse> => {
    return this.makeRequest<ApproveAgentPlanResponse>(
      this.agentEnginePath(`plan/${flowId}/approve`),
      'POST',
      data ?? {}
    );
  };

  public rerunAgentPlan = async (
    flowId: string,
    data?: ApproveAgentPlanRequest
  ): Promise<ApproveAgentPlanResponse> => {
    return this.makeRequest<ApproveAgentPlanResponse>(
      this.agentEnginePath(`plan/${flowId}/rerun`),
      'POST',
      data ?? {}
    );
  };

  public rejectAgentPlan = async (flowId: string): Promise<RejectAgentPlanResponse> => {
    return this.makeRequest<RejectAgentPlanResponse>(
      this.agentEnginePath(`plan/${flowId}/reject`),
      'POST',
      {}
    );
  };

  /** Relative URL path for plan execution SSE (authorize as for other API calls). */
  public getAgentPlanStreamRelativePath(flowId: string): string {
    return this.agentEnginePath(`plan/${flowId}/stream`);
  }

  public listAgentTools = async (): Promise<ListAgentToolsResponse> => {
    return this.makeRequest<ListAgentToolsResponse>(this.agentEnginePath('tools'), 'GET', null);
  };

  public refreshAgentTools = async (): Promise<RefreshAgentToolsResponse> => {
    return this.makeRequest<RefreshAgentToolsResponse>(
      this.agentEnginePath('tools/refresh'),
      'POST',
      {}
    );
  };

  public listAgentTemplates = async (
    query: ListAgentTemplatesQuery
  ): Promise<ListAgentTemplatesResponse> => {
    const params = new URLSearchParams();
    params.set('org_id', query.org_id);
    if (query.limit !== undefined) {
      params.set('limit', String(query.limit));
    }
    if (query.offset !== undefined) {
      params.set('offset', String(query.offset));
    }
    return this.makeRequest<ListAgentTemplatesResponse>(
      `${this.agentEnginePath('templates')}?${params.toString()}`,
      'GET',
      null
    );
  };

  public getAgentTemplate = async (templateId: string): Promise<GetAgentTemplateResponse> => {
    return this.makeRequest<GetAgentTemplateResponse>(
      this.agentEnginePath(`templates/${templateId}`),
      'GET',
      null
    );
  };

  public createAgentTemplate = async (
    data: CreateAgentTemplateRequest
  ): Promise<CreateAgentTemplateResponse> => {
    return this.makeRequest<CreateAgentTemplateResponse>(
      this.agentEnginePath('templates'),
      'POST',
      data
    );
  };

  public updateAgentTemplate = async (
    templateId: string,
    data: UpdateAgentTemplateRequest
  ): Promise<UpdateAgentTemplateResponse> => {
    return this.makeRequest<UpdateAgentTemplateResponse>(
      this.agentEnginePath(`templates/${templateId}`),
      'PUT',
      data
    );
  };

  public deleteAgentTemplate = async (templateId: string): Promise<DeleteAgentTemplateResponse> => {
    return this.makeRequest<DeleteAgentTemplateResponse>(
      this.agentEnginePath(`templates/${templateId}`),
      'DELETE',
      null
    );
  };

  public getAgentTemplateLogs = async (
    templateId: string,
    query?: ListAgentTemplateLogsQuery
  ): Promise<GetAgentTemplateLogsResponse> => {
    const params = new URLSearchParams();
    if (query?.limit !== undefined) {
      params.set('limit', String(query.limit));
    }
    if (query?.offset !== undefined) {
      params.set('offset', String(query.offset));
    }
    const qs = params.toString();
    const path =
      qs.length > 0
        ? `${this.agentEnginePath(`templates/${templateId}/logs`)}?${qs}`
        : this.agentEnginePath(`templates/${templateId}/logs`);
    return this.makeRequest<GetAgentTemplateLogsResponse>(path, 'GET', null);
  };

  public refreshAgentTemplateBlueprint = async (
    templateId: string,
    data?: RefreshAgentTemplateBlueprintRequest
  ): Promise<RefreshAgentTemplateBlueprintResponse> => {
    return this.makeRequest<RefreshAgentTemplateBlueprintResponse>(
      this.agentEnginePath(`templates/${templateId}/refresh-blueprint`),
      'POST',
      data ?? {}
    );
  };

  public listAgentSnippets = async (
    query: ListAgentSnippetsQuery
  ): Promise<ListAgentSnippetsResponse> => {
    return this.makeRequest<ListAgentSnippetsResponse>(this.agentEnginePath('snippets'), 'GET', {
      org_id: query.org_id,
      provider: query.provider,
      resource_type: query.resource_type,
      purpose: query.purpose,
      reusable: query.reusable === undefined ? undefined : String(query.reusable),
    });
  };

  public getAgentSnippet = async (snippetId: string): Promise<GetAgentSnippetResponse> => {
    return this.makeRequest<GetAgentSnippetResponse>(
      this.agentEnginePath(`snippets/${snippetId}`),
      'GET',
      null
    );
  };

  public updateAgentSnippet = async (
    snippetId: string,
    data: UpdateAgentSnippetRequest
  ): Promise<UpdateAgentSnippetResponse> => {
    return this.makeRequest<UpdateAgentSnippetResponse>(
      this.agentEnginePath(`snippets/${snippetId}`),
      'PUT',
      data
    );
  };

  public deleteAgentSnippet = async (snippetId: string): Promise<DeleteAgentSnippetResponse> => {
    return this.makeRequest<DeleteAgentSnippetResponse>(
      this.agentEnginePath(`snippets/${snippetId}`),
      'DELETE',
      null
    );
  };

  public listAgentSnippetVersions = async (
    snippetId: string
  ): Promise<ListAgentSnippetVersionsResponse> => {
    return this.makeRequest<ListAgentSnippetVersionsResponse>(
      this.agentEnginePath(`snippets/${snippetId}/versions`),
      'GET',
      null
    );
  };

  public getAgentSnippetVersion = async (
    snippetId: string,
    version: number
  ): Promise<GetAgentSnippetVersionResponse> => {
    return this.makeRequest<GetAgentSnippetVersionResponse>(
      this.agentEnginePath(`snippets/${snippetId}/versions/${version}`),
      'GET',
      null
    );
  };

  ////// User API
  public userRegister = async (data: RegisterBody): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('user/register', 'POST', data);
  };

  public preVerifyEmail = async (token: string): Promise<PreVerifyEmailResponse> => {
    return this.makeRequest<PreVerifyEmailResponse>('user/pre-verify-email', 'POST', { token });
  };

  public validateRegistration = async (
    token: string,
    password?: string
  ): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('/user/verify-email', 'POST', { token, password });
  };

  public resendVerificationEmail = async (
    verificationTokenId: string
  ): Promise<ResendVerificationEmailResponse> => {
    return this.makeRequest<ResendVerificationEmailResponse>(
      `user/resend-verification/${verificationTokenId}`,
      'POST',
      null
    );
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

  public userActivate = async (data: ActivateUserRequest): Promise<ActivateUserResponse> => {
    return this.makeRequest<ActivateUserResponse>('user/activate', 'POST', data);
  };

  public userDeactivate = async (): Promise<DeactivateResponse> => {
    return this.makeRequest<DeactivateResponse>('user/deactivate', 'POST', null);
  };

  public getUserQuota = async (): Promise<QuotaResponse> => {
    return this.makeRequest<QuotaResponse>('user/quota', 'GET', null);
  };

  public updateUser = async (
    userId: string,
    data: UserUpdateRequest
  ): Promise<UserUpdateResponse> => {
    return this.makeRequest<UserUpdateResponse>(`user/${userId}`, 'PUT', data);
  };

  public requestPasswordReset = async (email: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>('user/request-reset-password', 'POST', { email });
  };

  public resetPassword = async (data: ResetPasswordBody): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>('user/reset-password', 'POST', data);
  };

  public requestDemo = async (data: DemoRequestBody): Promise<DemoRequestResponse> => {
    return this.makeRequest<DemoRequestResponse>('demo/request', 'POST', data);
  };

  ////// Links API
  public getLinks = async (query?: GetLinksRequest): Promise<GetLinksResponse> => {
    const queryParams = new URLSearchParams();
    if (query?.from) {
      queryParams.append('from', query.from);
    }
    if (query?.to) {
      queryParams.append('to', query.to);
    }
    if (query?.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query?.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    if (query?.status) {
      queryParams.append('status', query.status);
    }
    if (query?.text) {
      queryParams.append('text', query.text);
    }
    return this.makeRequest<GetLinksResponse>(
      `links${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public createLink = async (data: CreateLinkRequest): Promise<CreateLinkResponse> => {
    return this.makeRequest<CreateLinkResponse>('links', 'POST', data);
  };

  public updateLink = async (
    linkId: string,
    data: UpdateLinkRequest
  ): Promise<UpdateLinkResponse> => {
    return this.makeRequest<UpdateLinkResponse>(`links/${linkId}`, 'PUT', data);
  };

  public deleteLink = async (linkId: string): Promise<DeleteLinkResponse> => {
    return this.makeRequest<DeleteLinkResponse>(`links/${linkId}`, 'DELETE', null);
  };

  public getLink = async (linkId: string, token: string): Promise<GetLinkByTokenResponse> => {
    return this.makeRequest<GetLinkByTokenResponse>(
      `links/${linkId}?token=${encodeURIComponent(token)}`,
      'GET',
      null
    );
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
  public async getDailyStats(
    params: StatsQueryParams | StatsQueryWithBucketParams
  ): Promise<StatsResponse> {
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
  public async getMinuteStats(
    params: StatsQueryParams | StatsQueryWithBucketParams
  ): Promise<StatsResponse> {
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

  // AI Stats methods
  public async getAiStatsDaily(params: AiStatsQueryParams): Promise<AiStatsResponse> {
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

    if (params.aiLlmId && params.aiLlmId.length > 0) {
      queryParams.append('aiLlmId', params.aiLlmId.join(','));
    }

    if (params.repoAiApiKeyId && params.repoAiApiKeyId.length > 0) {
      queryParams.append('repoAiApiKeyId', params.repoAiApiKeyId.join(','));
    }

    if (params.hosts && params.hosts.length > 0) {
      queryParams.append('hosts', params.hosts.join(','));
    }

    if (params.llmType && params.llmType.length > 0) {
      queryParams.append('llmType', params.llmType.join(','));
    }

    if (params.llmModel && params.llmModel.length > 0) {
      queryParams.append('llmModel', params.llmModel.join(','));
    }

    if (params.userUuid && params.userUuid.length > 0) {
      queryParams.append('userUuid', params.userUuid.join(','));
    }

    if (params.conversationUuid && params.conversationUuid.length > 0) {
      queryParams.append('conversationUuid', params.conversationUuid.join(','));
    }

    return this.makeRequest<AiStatsResponse>(
      `aistats/daily?${queryParams.toString()}`,
      'GET',
      null
    );
  }

  public async getAiStatsMinute(params: AiStatsQueryParams): Promise<AiStatsResponse> {
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

    if (params.aiLlmId && params.aiLlmId.length > 0) {
      queryParams.append('aiLlmId', params.aiLlmId.join(','));
    }

    if (params.repoAiApiKeyId && params.repoAiApiKeyId.length > 0) {
      queryParams.append('repoAiApiKeyId', params.repoAiApiKeyId.join(','));
    }

    if (params.hosts && params.hosts.length > 0) {
      queryParams.append('hosts', params.hosts.join(','));
    }

    if (params.llmType && params.llmType.length > 0) {
      queryParams.append('llmType', params.llmType.join(','));
    }

    if (params.llmModel && params.llmModel.length > 0) {
      queryParams.append('llmModel', params.llmModel.join(','));
    }

    if (params.userUuid && params.userUuid.length > 0) {
      queryParams.append('userUuid', params.userUuid.join(','));
    }

    if (params.conversationUuid && params.conversationUuid.length > 0) {
      queryParams.append('conversationUuid', params.conversationUuid.join(','));
    }

    return this.makeRequest<AiStatsResponse>(
      `aistats/minute?${queryParams.toString()}`,
      'GET',
      null
    );
  }

  // Function overloads for getNodeStatsMinute
  public getNodeStatsMinute(params: NodeStatsQueryParams): Promise<NodeStatsMinuteResponse>;
  public getNodeStatsMinute(
    params: NodeStatsQueryWithBucketParams
  ): Promise<NodeStatsMinuteResponse>;
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
  public getNodeStatsDaily(
    params: NodeStatsDailyQueryWithBucketParams
  ): Promise<NodeStatsDailyResponse>;
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

  public getBucketStats = async (params?: {
    bucketId?: string[];
  }): Promise<BucketStatsResponse> => {
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

  public getNodeInfo = async (nodeServices: number): Promise<NodeInfoResponse> => {
    return this.makeRequest<NodeInfoResponse>('node?nodeServices=' + nodeServices, 'GET', null);
  };

  public getPrivateNodeInfo = async (orgId: string): Promise<NodeInfoResponse> => {
    return this.makeRequest<NodeInfoResponse>(`organization/${orgId}/nodes`, 'GET', null);
  };

  public deletePrivateNode = async (
    orgId: string,
    nodeId: string
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      `organization/${orgId}/node/${nodeId}`,
      'DELETE',
      null
    );
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

  public buySubscription = async (
    data: BuySubscriptionRequest
  ): Promise<BuySubscriptionResponse> => {
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

  public getCheckoutSessionStatus = async (
    id: string
  ): Promise<GetCheckoutSessionStatusResponse> => {
    return this.makeRequest<GetCheckoutSessionStatusResponse>(
      `subscriptions/checkout-session/${id}`,
      'GET',
      null
    );
  };

  public getPendingPayment = async (): Promise<GetPendingPaymentResponse> => {
    return this.makeRequest<GetPendingPaymentResponse>(
      'subscriptions/pending-payment',
      'GET',
      null
    );
  };

  public cancelPendingPayment = async (): Promise<CancelPendingPaymentResponse> => {
    return this.makeRequest<CancelPendingPaymentResponse>(
      'subscriptions/pending-payment',
      'DELETE',
      null
    );
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
    return this.makeRequest<SessionHeartbeatResponse>(
      `sessions/${sessionId}/heartbeat`,
      'POST',
      null
    );
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

  public verifyMFASetup = async (
    request: MFAVerificationSetupRequest
  ): Promise<MFAVerificationSetupResponse> => {
    return this.makeRequest<MFAVerificationSetupResponse>('mfa/verify-setup', 'POST', request);
  };

  public verifyMFALogin = async (
    request: MFAVerificationRequest
  ): Promise<MFAVerificationLoginResponse> => {
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
  public enforceOrganizationMFA = async (
    request: MFAOrganizationEnforceRequest
  ): Promise<MFAOrganizationEnforceResponse> => {
    return this.makeRequest<MFAOrganizationEnforceResponse>(
      'mfa/organization/enforce',
      'POST',
      request
    );
  };

  ////// Magic Link MFA API
  public sendMagicLink = async (): Promise<MagicLinkSendResponse> => {
    return this.makeRequest<MagicLinkSendResponse>('mfa/magic-link/send', 'POST', null);
  };

  public activateMagicLink = async (
    data: MagicLinkActivationRequest
  ): Promise<MagicLinkActivationResponse> => {
    return this.makeRequest<MagicLinkActivationResponse>('mfa/magic-link/activate', 'POST', data);
  };

  ////// Passkey MFA API
  public getPasskeyAuthOptions = async (): Promise<PasskeyAuthOptionsResult> => {
    return this.makeRequest<PasskeyAuthOptionsResult>('mfa/passkey/auth-options', 'POST', null);
  };

  public completePasskeyRegistration = async (
    request: PasskeyCompleteRegistrationRequest
  ): Promise<PasskeyCompleteRegistrationResponse> => {
    return this.makeRequest<PasskeyCompleteRegistrationResponse>(
      'mfa/passkey/complete-registration',
      'POST',
      request
    );
  };

  public getUserSettings = async (): Promise<GetSettingsResponse> => {
    return this.makeRequest<GetSettingsResponse>('settings/user', 'GET');
  };

  public updateUserSettings = async (
    request: UpdateSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      'settings/user',
      'POST',
      request
    );
  };

  public partialUpdateUserSettings = async (
    request: PartialUpdateSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>('settings/user', 'PUT', request);
  };

  public deleteUserSettingsKeys = async (
    request: DeleteSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      'settings/user',
      'DELETE',
      request
    );
  };

  // Organization Settings Methods
  public getOrganizationSettings = async (): Promise<GetSettingsResponse> => {
    return this.makeRequest<GetSettingsResponse>('settings/organization', 'GET');
  };

  public updateOrganizationSettings = async (
    request: UpdateSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      'settings/organization',
      'POST',
      request
    );
  };

  public partialUpdateOrganizationSettings = async (
    request: PartialUpdateSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      'settings/organization',
      'PUT',
      request
    );
  };

  public deleteOrganizationSettingsKeys = async (
    request: DeleteSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      'settings/organization',
      'DELETE',
      request
    );
  };

  // Role/profile management methods
  public getUserProfile = async (): Promise<UserProfileResponse> => {
    return this.makeRequest<UserProfileResponse>('user/profile', 'GET', null);
  };

  public getUserById = async (userId: string): Promise<UserRoleResponse> => {
    return this.makeRequest<UserRoleResponse>(`user/${userId}`, 'GET', null);
  };

  public updateUserRole = async (
    userId: string,
    orgRole: number
  ): Promise<UpdateUserRoleResponse> => {
    return this.makeRequest<UpdateUserRoleResponse>(`user/${userId}/role`, 'PUT', { orgRole });
  };

  ////// Workspace Management API
  public createWorkspace = async (
    request: WorkspaceTypes.CreateWorkspaceRequest
  ): Promise<WorkspaceTypes.CreateWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.CreateWorkspaceResponse>('workspace', 'POST', request);
  };

  public getWorkspaces = async (): Promise<WorkspaceTypes.GetWorkspacesResponse> => {
    return this.makeRequest<WorkspaceTypes.GetWorkspacesResponse>('workspace', 'GET', null);
  };

  public getWorkspace = async (id: string): Promise<WorkspaceTypes.GetWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.GetWorkspaceResponse>(`workspace/${id}`, 'GET', null);
  };

  public updateWorkspace = async (
    id: string,
    request: WorkspaceTypes.UpdateWorkspaceRequest
  ): Promise<WorkspaceTypes.UpdateWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.UpdateWorkspaceResponse>(
      `workspace/${id}`,
      'PUT',
      request
    );
  };

  public deleteWorkspace = async (id: string): Promise<WorkspaceTypes.DeleteWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.DeleteWorkspaceResponse>(
      `workspace/${id}`,
      'DELETE',
      null
    );
  };

  ////// Workspace User Management API
  public addUserToWorkspace = async (
    workspaceId: string,
    request: WorkspaceTypes.AddUserToWorkspaceRequest
  ): Promise<WorkspaceTypes.AddUserToWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.AddUserToWorkspaceResponse>(
      `workspace/${workspaceId}/users`,
      'POST',
      request
    );
  };

  public updateWorkspaceUserRole = async (
    workspaceId: string,
    userId: string,
    request: WorkspaceTypes.UpdateUserRoleRequest
  ): Promise<WorkspaceTypes.UpdateUserRoleResponse> => {
    return this.makeRequest<WorkspaceTypes.UpdateUserRoleResponse>(
      `workspace/${workspaceId}/users/${userId}`,
      'PUT',
      request
    );
  };

  public removeUserFromWorkspace = async (
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceTypes.RemoveUserFromWorkspaceResponse> => {
    return this.makeRequest<WorkspaceTypes.RemoveUserFromWorkspaceResponse>(
      `workspace/${workspaceId}/users/${userId}`,
      'DELETE',
      null
    );
  };

  // Organization Users Management
  public getOrganizationUsers = async (): Promise<ListOrgUsersResponse> => {
    return this.makeRequest<ListOrgUsersResponse>('organization/users', 'GET', null);
  };

  public createOrganizationUser = async (
    request: CreateOrgUserRequest
  ): Promise<CreateOrgUserResponse> => {
    return this.makeRequest<CreateOrgUserResponse>('organization/users', 'POST', request);
  };

  public resendTeamUserInvitation = async (userId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(
      `organization/users/${userId}/resend-invitation`,
      'POST',
      null
    );
  };

  public getOrganizationUser = async (
    userId: string
  ): Promise<OrgUserResponse | { success: false; message: string }> => {
    return this.makeRequest<OrgUserResponse | { success: false; message: string }>(
      `organization/users/${userId}`,
      'GET',
      null
    );
  };

  public updateOrganizationUser = async (
    userId: string,
    request: UpdateOrgUserRequest
  ): Promise<UpdateOrgUserResponse> => {
    return this.makeRequest<UpdateOrgUserResponse>(`organization/users/${userId}`, 'PUT', request);
  };

  public deleteOrganizationUser = async (userId: string): Promise<DeleteOrgUserResponse> => {
    return this.makeRequest<DeleteOrgUserResponse>(`organization/users/${userId}`, 'DELETE', null);
  };

  public activateOrganizationUser = async (
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      `organization/users/${userId}/activate`,
      'POST',
      null
    );
  };

  public getOrganization = async (orgId: string): Promise<GetOrganizationResponse> => {
    return this.makeRequest<GetOrganizationResponse>(`organization/${orgId}`, 'GET', null);
  };

  public updateOrganization = async (
    orgId: string,
    request: UpdateOrganizationBody
  ): Promise<UpdateOrganizationResponse> => {
    return this.makeRequest<UpdateOrganizationResponse>(`organization/${orgId}`, 'PUT', request);
  };

  // Node registration methods
  // Organization Keys API calls
  public generateOrgKey = async (idOrg: string): Promise<string> => {
    return this.makeRequest<string>(`organization/${idOrg}/key`, 'POST');
  };

  public deleteOrgKeys = async (idOrg: string): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      `organization/${idOrg}/key`,
      'DELETE'
    );
  };

  public getOrgKeys = async (idOrg: string): Promise<GetOrganizationKeysResponse> => {
    return this.makeRequest<GetOrganizationKeysResponse>(`organization/${idOrg}/key`, 'GET');
  };

  public deleteOrgKey = async (
    idOrg: string,
    keyId: string
  ): Promise<{ success: boolean; message: string }> => {
    return this.makeRequest<{ success: boolean; message: string }>(
      `organization/${idOrg}/key/${keyId}`,
      'DELETE'
    );
  };

  // Node Registration API calls
  public nodeRegister = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('register', 'POST', data);
  };

  public nodeUnregister = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return this.makeRequest<RegisterResponse>('unregister', 'POST', data);
  };

  // System Event API calls
  public getSystemEvents = async (
    data: SystemEventQueryRequest
  ): Promise<SystemEventQueryResponse> => {
    return this.makeRequest<SystemEventQueryResponse>('systemevent', 'POST', data);
  };

  public markSystemEventAsRead = async (
    systemEventLogId: number | number[]
  ): Promise<SystemEventReadStatusResponse> => {
    const body: SystemEventReadIdsRequest = Array.isArray(systemEventLogId)
      ? { ids: systemEventLogId }
      : { id: systemEventLogId };
    return this.makeRequest<SystemEventReadStatusResponse>('systemevent/read', 'POST', body);
  };

  public markSystemEventAsUnread = async (
    systemEventLogId: number | number[]
  ): Promise<SystemEventReadStatusResponse> => {
    const body: SystemEventReadIdsRequest = Array.isArray(systemEventLogId)
      ? { ids: systemEventLogId }
      : { id: systemEventLogId };
    return this.makeRequest<SystemEventReadStatusResponse>('systemevent/read', 'DELETE', body);
  };

  ////// AI LLM API calls
  public createAiLlm = async (data: CreateAiLlmRequest): Promise<CreateAiLlmResponse> => {
    return this.makeRequest<CreateAiLlmResponse>('ai/llm', 'POST', data);
  };

  public getAiLlms = async (workspaceId?: string): Promise<GetAiLlmsResponse> => {
    const queryParams = new URLSearchParams();
    if (workspaceId) {
      queryParams.append('workspaceId', workspaceId);
    }
    return this.makeRequest<GetAiLlmsResponse>(
      `ai/llm${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public getAiLlmStats = async (aiLlmId?: string): Promise<AiLlmStatsResponse> => {
    const queryParams = new URLSearchParams();
    if (aiLlmId) {
      queryParams.append('aiLlmId', aiLlmId);
    }
    return this.makeRequest<AiLlmStatsResponse>(
      `ai/llm/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public getAvailableAiLlms = async (): Promise<GetAiLlmsResponse> => {
    return this.makeRequest<GetAiLlmsResponse>('ai/llm/available', 'GET', null);
  };

  public updateAiLlm = async (
    id: string,
    data: UpdateAiLlmRequest
  ): Promise<UpdateAiLlmResponse> => {
    return this.makeRequest<UpdateAiLlmResponse>(`ai/llm/${id}`, 'PUT', data);
  };

  public deleteAiLlm = async (id: string): Promise<DeleteAiLlmResponse> => {
    return this.makeRequest<DeleteAiLlmResponse>(`ai/llm/${id}`, 'DELETE', null);
  };

  public validateAiLlm = async (id: string): Promise<ValidateAiLlmResponse> => {
    return this.makeRequest<ValidateAiLlmResponse>(`ai/llm/${id}/validate`, 'POST', null);
  };

  ////// AI API Key API calls
  public createRepoAiApiKey = async (
    repoId: string,
    data: CreateRepoAiApiKeyRequest
  ): Promise<CreateRepoAiApiKeyResponse> => {
    return this.makeRequest<CreateRepoAiApiKeyResponse>(`repo/${repoId}/ai/apikey`, 'POST', data);
  };

  public getRepoAiApiKeys = async (repoId: string): Promise<GetRepoAiApiKeysResponse> => {
    return this.makeRequest<GetRepoAiApiKeysResponse>(`repo/${repoId}/ai/apikey`, 'GET', null);
  };

  public updateRepoAiApiKey = async (
    repoId: string,
    apikeyId: string,
    data: UpdateRepoAiApiKeyRequest
  ): Promise<UpdateRepoAiApiKeyResponse> => {
    return this.makeRequest<UpdateRepoAiApiKeyResponse>(
      `repo/${repoId}/ai/apikey/${apikeyId}`,
      'PUT',
      data
    );
  };

  public deleteRepoAiApiKey = async (
    repoId: string,
    apikeyId: string
  ): Promise<DeleteRepoAiApiKeyResponse> => {
    return this.makeRequest<DeleteRepoAiApiKeyResponse>(
      `repo/${repoId}/ai/apikey/${apikeyId}`,
      'DELETE',
      null
    );
  };

  ////// Conversation API calls
  public createConversation = async (
    data: CreateConversationRequest
  ): Promise<CreateConversationResponse> => {
    return this.makeRequest<CreateConversationResponse>('conversation', 'POST', data);
  };

  public sendPrompt = async (
    conversationId: string,
    data: SendPromptRequest
  ): Promise<SendPromptResponse> => {
    return this.makeRequest<SendPromptResponse>(
      `conversation/${conversationId}/prompt`,
      'POST',
      data
    );
  };

  public getConversations = async (
    query: GetConversationsRequest
  ): Promise<GetConversationsResponse> => {
    const queryParams = new URLSearchParams();
    if (query.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    if (query.from) {
      queryParams.append('from', query.from);
    }
    if (query.to) {
      queryParams.append('to', query.to);
    }
    if (query.userId) {
      queryParams.append('userId', query.userId);
    }
    if (query.workspaceId) {
      queryParams.append('workspaceId', query.workspaceId);
    }
    if (query.repoId) {
      queryParams.append('repoId', query.repoId);
    }
    if (query.showDeleted !== undefined) {
      queryParams.append('showDeleted', query.showDeleted.toString());
    }
    return this.makeRequest<GetConversationsResponse>(
      `conversation?${queryParams.toString()}`,
      'GET',
      null
    );
  };

  public getConversationMessages = async (
    conversationId: string,
    query: GetConversationMessagesRequest
  ): Promise<GetConversationMessagesResponse> => {
    const queryParams = new URLSearchParams();
    if (query.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    return this.makeRequest<GetConversationMessagesResponse>(
      `conversation/${conversationId}/messages`,
      'GET',
      null
    );
  };

  public deleteConversation = async (
    data: DeleteConversationRequest
  ): Promise<DeleteConversationResponse> => {
    return this.makeRequest<DeleteConversationResponse>(
      `conversation/${encodeURIComponent(data.conversationId)}?hardDelete=${data.hardDelete}`,
      'DELETE',
      null
    );
  };

  ////// Policy API calls
  public createPolicy = async (
    data: CreatePolicyRequest
  ): Promise<{ success: boolean; policy: PolicyDTO }> => {
    return this.makeRequest<{ success: boolean; policy: PolicyDTO }>('policy', 'POST', data);
  };

  public getPolicies = async (
    query: GetPoliciesQuery
  ): Promise<{ success: boolean; policies: PolicyDTO[] }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('orgId', query.orgId);
    if (query.workspaceId) {
      queryParams.append('workspaceId', query.workspaceId);
    }
    if (query.repoId) {
      queryParams.append('repoId', query.repoId);
    }
    return this.makeRequest<{ success: boolean; policies: PolicyDTO[] }>(
      `policy?${queryParams.toString()}`,
      'GET',
      null
    );
  };

  public getPolicy = async (policyId: string): Promise<{ success: boolean; policy: PolicyDTO }> => {
    return this.makeRequest<{ success: boolean; policy: PolicyDTO }>(
      `policy/${policyId}`,
      'GET',
      null
    );
  };

  public updatePolicy = async (
    policyId: string,
    data: UpdatePolicyRequest
  ): Promise<{ success: boolean; policy: PolicyDTO }> => {
    return this.makeRequest<{ success: boolean; policy: PolicyDTO }>(
      `policy/${policyId}`,
      'PUT',
      data
    );
  };

  public deletePolicy = async (policyId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`policy/${policyId}`, 'DELETE', null);
  };

  public getPolicyViolations = async (
    query: GetPolicyViolationsQuery
  ): Promise<GetPolicyViolationsResponse> => {
    const queryParams = new URLSearchParams();
    if (query.workspaceId) {
      queryParams.append('workspaceId', query.workspaceId);
    }
    if (query.repoId) {
      queryParams.append('repoId', query.repoId);
    }
    if (query.policyId) {
      queryParams.append('policyId', query.policyId);
    }
    if (query.from) {
      queryParams.append('from', query.from);
    }
    if (query.to) {
      queryParams.append('to', query.to);
    }
    if (query.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    if (query.llmType && query.llmType.length > 0) {
      queryParams.append('llmType', query.llmType.join(','));
    }
    if (query.llmModel && query.llmModel.length > 0) {
      queryParams.append('llmModel', query.llmModel.join(','));
    }
    if (query.host && query.host.length > 0) {
      queryParams.append('host', query.host.join(','));
    }
    if (query.severity && query.severity.length > 0) {
      queryParams.append('severity', query.severity.join(','));
    }
    if (query.block !== undefined) {
      queryParams.append('block', query.block.toString());
    }
    return this.makeRequest<GetPolicyViolationsResponse>(
      `policy/violations?${queryParams.toString()}`,
      'GET',
      null
    );
  };

  public getPolicyViolationsByPolicyId = async (
    policyId: string,
    query: Omit<GetPolicyViolationsQuery, 'policyId'>
  ): Promise<GetPolicyViolationsResponse> => {
    const queryParams = new URLSearchParams();
    if (query.workspaceId) {
      queryParams.append('workspaceId', query.workspaceId);
    }
    if (query.repoId) {
      queryParams.append('repoId', query.repoId);
    }
    if (query.from) {
      queryParams.append('from', query.from);
    }
    if (query.to) {
      queryParams.append('to', query.to);
    }
    if (query.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    if (query.llmType && query.llmType.length > 0) {
      queryParams.append('llmType', query.llmType.join(','));
    }
    if (query.llmModel && query.llmModel.length > 0) {
      queryParams.append('llmModel', query.llmModel.join(','));
    }
    if (query.host && query.host.length > 0) {
      queryParams.append('host', query.host.join(','));
    }
    if (query.severity && query.severity.length > 0) {
      queryParams.append('severity', query.severity.join(','));
    }
    if (query.block !== undefined) {
      queryParams.append('block', query.block.toString());
    }
    return this.makeRequest<GetPolicyViolationsResponse>(
      `policy/${policyId}/violations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public getPolicyAlerts = async (
    query: GetPolicyAlertsQuery
  ): Promise<GetPolicyAlertsResponse> => {
    const queryParams = new URLSearchParams();
    if (query.workspaceId) {
      queryParams.append('workspaceId', query.workspaceId);
    }
    if (query.repoId) {
      queryParams.append('repoId', query.repoId);
    }
    if (query.policyId) {
      queryParams.append('policyId', query.policyId);
    }
    if (query.from) {
      queryParams.append('from', query.from);
    }
    if (query.to) {
      queryParams.append('to', query.to);
    }
    if (query.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    if (query.llmType && query.llmType.length > 0) {
      queryParams.append('llmType', query.llmType.join(','));
    }
    if (query.llmModel && query.llmModel.length > 0) {
      queryParams.append('llmModel', query.llmModel.join(','));
    }
    if (query.host && query.host.length > 0) {
      queryParams.append('host', query.host.join(','));
    }
    return this.makeRequest<GetPolicyAlertsResponse>(
      `policy/alerts?${queryParams.toString()}`,
      'GET',
      null
    );
  };

  public getPolicyAlertsByPolicyId = async (
    policyId: string,
    query: Omit<GetPolicyAlertsQuery, 'policyId'>
  ): Promise<GetPolicyAlertsResponse> => {
    const queryParams = new URLSearchParams();
    if (query.workspaceId) {
      queryParams.append('workspaceId', query.workspaceId);
    }
    if (query.repoId) {
      queryParams.append('repoId', query.repoId);
    }
    if (query.from) {
      queryParams.append('from', query.from);
    }
    if (query.to) {
      queryParams.append('to', query.to);
    }
    if (query.take !== undefined) {
      queryParams.append('take', query.take.toString());
    }
    if (query.skip !== undefined) {
      queryParams.append('skip', query.skip.toString());
    }
    if (query.llmType && query.llmType.length > 0) {
      queryParams.append('llmType', query.llmType.join(','));
    }
    if (query.llmModel && query.llmModel.length > 0) {
      queryParams.append('llmModel', query.llmModel.join(','));
    }
    if (query.host && query.host.length > 0) {
      queryParams.append('host', query.host.join(','));
    }
    return this.makeRequest<GetPolicyAlertsResponse>(
      `policy/${policyId}/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      'GET',
      null
    );
  };

  public validatePolicies = async (
    data: PolicyValidationRequest
  ): Promise<PolicyValidationResponse> => {
    return this.makeRequest<PolicyValidationResponse>('policy/validate', 'POST', data);
  };

  public recommendPolicies = async (
    data: PolicyRecommendationRequest
  ): Promise<PolicyRecommendationResponse> => {
    return this.makeRequest<PolicyRecommendationResponse>('policy/recommend', 'POST', data);
  };

  public getAiModels = async (data: GetAiModelsRequest): Promise<GetAiModelsResponse> => {
    return this.makeRequest<GetAiModelsResponse>('ai/models', 'POST', data);
  };

  ////// Credits API calls
  public getCreditsBalance = async (): Promise<GetCreditsBalanceResponse> => {
    return this.makeRequest<GetCreditsBalanceResponse>('credits/balance', 'GET', null);
  };

  public getCreditsTransactions = async (
    query: GetCreditsTransactionsRequest
  ): Promise<GetCreditsTransactionsResponse> => {
    const result = await this.makeRequest<GetCreditsTransactionsResponse>(
      'credits/transactions',
      'GET',
      query
    );
    return result;
  };

  /** Consumption = transactions with direction 'out' (backend uses same endpoint) */
  public getCreditsConsumption = async (
    query: GetCreditsConsumptionRequest
  ): Promise<GetCreditsConsumptionResponse> => {
    return this.makeRequest<GetCreditsConsumptionResponse>('credits/transactions', 'GET', {
      ...query,
      direction: 'out',
    });
  };

  public buyCreditsPack = async (body: BuyCreditsPackRequest): Promise<BuyCreditsPackResponse> => {
    return this.makeRequest<BuyCreditsPackResponse>('credits/packs/buy', 'POST', body);
  };

  public getCreditsPacks = async (): Promise<GetCreditsPacksResponse> => {
    return this.makeRequest<GetCreditsPacksResponse>('credits/packs', 'GET', null);
  };

  public getCreditsRates = async (): Promise<GetCreditsRatesResponse> => {
    return this.makeRequest<GetCreditsRatesResponse>('credits/rates', 'GET', null);
  };

  /** Get aggregated monthly credit stats for histogram (consumption, purchases, grants, balance) */
  public getCreditsMonthlyStats = async (
    query?: GetCreditsMonthlyStatsRequest
  ): Promise<GetCreditsMonthlyStatsResponse> => {
    const result = await this.makeRequest<GetCreditsMonthlyStatsResponse>(
      'credits/stats/monthly',
      'GET',
      query ?? null
    );
    return result;
  };

  // ====================================================================
  // V2 Dashboard Statistics API
  // ====================================================================

  // ---- Storage Gateway ----

  /** GET /v2/stats/storage — Time-series for storage gateway metrics. */
  public getStorageGatewayStats = async (
    params: V2StorageStatsQueryParams
  ): Promise<StorageTimeSeriesResponse> => {
    return this.makeRequest<StorageTimeSeriesResponse>('v2/stats/storage', 'GET', params);
  };

  /**
   * GET /v2/stats/storage/breakdown/{by} — Storage breakdown by dimension.
   * Use `by = 'providers'` for the provider breakdown which returns protocol/endpoint metadata.
   */
  public getStorageGatewayBreakdown = async (
    by: Exclude<StorageBreakdownBy, 'providers'>,
    params: DashboardBreakdownQueryParams
  ): Promise<StorageBreakdownResponse> => {
    return this.makeRequest<StorageBreakdownResponse>(
      `v2/stats/storage/breakdown/${by}`,
      'GET',
      params
    );
  };

  /** GET /v2/stats/storage/breakdown/providers — Includes protocol, provider, endpoint. */
  public getStorageGatewayProviderBreakdown = async (
    params: DashboardBreakdownQueryParams
  ): Promise<StorageProviderBreakdownResponse> => {
    return this.makeRequest<StorageProviderBreakdownResponse>(
      'v2/stats/storage/breakdown/providers',
      'GET',
      params
    );
  };

  // ---- AI Gateway ----

  /** GET /v2/stats/ai — Time-series for AI gateway metrics (excludes Private Chat). */
  public getAiGatewayStats = async (
    params: AiGatewayStatsQueryParams
  ): Promise<AiGatewayTimeSeriesResponse> => {
    return this.makeRequest<AiGatewayTimeSeriesResponse>('v2/stats/ai', 'GET', params);
  };

  /** GET /v2/stats/ai/breakdown/{by} — AI breakdown by dimension. */
  public getAiGatewayBreakdown = async (
    by: AiBreakdownBy,
    params: DashboardBreakdownQueryParams
  ): Promise<AiGatewayBreakdownResponse> => {
    return this.makeRequest<AiGatewayBreakdownResponse>(
      `v2/stats/ai/breakdown/${by}`,
      'GET',
      params
    );
  };

  // ---- Private Chat ----

  /**
   * GET /v2/stats/private-chat — Time-series for private-chat metrics.
   * Supports resource-level filters: `model` and `userId`.
   */
  public getPrivateChatStats = async (
    params: PrivateChatStatsQueryParams
  ): Promise<PrivateChatTimeSeriesResponse> => {
    return this.makeRequest<PrivateChatTimeSeriesResponse>('v2/stats/private-chat', 'GET', params);
  };

  /** GET /v2/stats/private-chat/breakdown/models — Model breakdown with optional series. */
  public getPrivateChatModelsBreakdown = async (
    params: DashboardBreakdownQueryParams
  ): Promise<PrivateChatModelBreakdownResponse> => {
    return this.makeRequest<PrivateChatModelBreakdownResponse>(
      'v2/stats/private-chat/breakdown/models',
      'GET',
      params
    );
  };

  /**
   * GET /v2/stats/private-chat/breakdown/users — Per-user totals + optional series.
   * Returns conversationsCount and lastActiveAt per user.
   */
  public getPrivateChatUsersBreakdown = async (
    params: DashboardBreakdownQueryParams
  ): Promise<PrivateChatUsersBreakdownResponse> => {
    return this.makeRequest<PrivateChatUsersBreakdownResponse>(
      'v2/stats/private-chat/breakdown/users',
      'GET',
      params
    );
  };

  // ---- Policies ----

  /**
   * GET /v2/stats/policies — Time-series of policy enforcement + token overhead.
   * Supports resource-level filter: `ruleId`.
   */
  public getPolicyStats = async (
    params: PolicyStatsQueryParams
  ): Promise<PolicyTimeSeriesResponse> => {
    return this.makeRequest<PolicyTimeSeriesResponse>('v2/stats/policies', 'GET', params);
  };

  /** GET /v2/stats/policies/tokens — Dedicated policy-token consumption time-series. */
  public getPolicyTokenStats = async (
    params: DashboardStatsQueryParams
  ): Promise<PolicyTokenTimeSeriesResponse> => {
    return this.makeRequest<PolicyTokenTimeSeriesResponse>(
      'v2/stats/policies/tokens',
      'GET',
      params
    );
  };

  /** GET /v2/stats/policies/breakdown/{by} — Policy breakdown by rules or users. */
  public getPolicyBreakdown = async (
    by: PolicyBreakdownBy,
    params: DashboardBreakdownQueryParams
  ): Promise<PolicyBreakdownResponse> => {
    return this.makeRequest<PolicyBreakdownResponse>(
      `v2/stats/policies/breakdown/${by}`,
      'GET',
      params
    );
  };

  // ---- Credits ----

  /** GET /v2/stats/credits — Credit consumption/grant time-series. */
  public getCreditStats = async (
    params: CreditStatsQueryParams
  ): Promise<CreditTimeSeriesResponse> => {
    return this.makeRequest<CreditTimeSeriesResponse>('v2/stats/credits', 'GET', params);
  };

  /** GET /v2/stats/credits/breakdown/{by} — Credit breakdown by dimension. */
  public getCreditBreakdown = async (
    by: CreditBreakdownBy,
    params: DashboardBreakdownQueryParams
  ): Promise<CreditBreakdownResponse> => {
    return this.makeRequest<CreditBreakdownResponse>(
      `v2/stats/credits/breakdown/${by}`,
      'GET',
      params
    );
  };

  // ====================================================================
  // Cloud Resources API
  // ====================================================================

  public upsertCloudResources = async (
    repoId: string,
    data: Omit<UpsertCloudResourcesRequest, 'repoId'>
  ): Promise<UpsertCloudResourcesResponse> => {
    return this.makeRequest<UpsertCloudResourcesResponse>(
      `repos/${repoId}/cloud-resources/upsert`,
      'POST',
      data
    );
  };

  public listCloudResources = async (
    repoId: string,
    query?: ListCloudResourcesQuery
  ): Promise<ListCloudResourcesResponse> => {
    return this.makeRequest<ListCloudResourcesResponse>(
      `repos/${repoId}/cloud-resources`,
      'GET',
      query || null
    );
  };
}
