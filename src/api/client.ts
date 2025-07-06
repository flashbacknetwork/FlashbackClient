import {
  CreateUnitRequest,
  CreateUnitResponse,
  CreateRepoRequest,
  CreateRepoResponse,
  StorageUnit,
  CreateRepoKeyRequest,
  CreateRepoKeyResponse,
  GetUnitsResponse,
  GetReposResponse,
  GetRepoKeysResponse,
  UpdateUnitRequest,
  UpdateUnitResponse,
  ActionResponse,
  UpdateRepoRequest,
  UpdateRepoResponse,
  UpdateRepoKeyRequest,
  UpdateRepoKeyResponse,
  ValidateUnitRequest,
  ValidateUnitResponse,
  ValidateRepoUnitsRequest,
  ValidateRepoUnitsResponse,
  StorageUnitStatusResponse,
  GetUnitNodeStatsResponse,
  GetUnitNodeStatsRequest,
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
} from './types/stats';
import { NodeInfo } from './types/bridge';
import { FeedbackEmailBody } from './types/email';
import { QuotaResponse } from './types/quota';
import {
  BuySubscriptionRequest,
  BuySubscriptionResponse,
  GetSubscriptionsResponse,
  MySubscriptionResponse,
  PaymentsListResponse,
  PaymentsQueryParams,
  CancelSubscriptionResponse,
} from './types/subscriptions';

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

  public authenticate = async (token: string, provider: ProviderType): Promise<any> => {
    this.setAuthToken(token);
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.authenticateGoogle(token);
      case ProviderType.GITHUB:
        return this.authenticateGithub(token);
      case ProviderType.WEB3_STELLAR:
        return this.authenticateWeb3Stellar(token);
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
        // TODO: Implement refresh token for Github
        throw new Error('Not implemented');
      case ProviderType.LOCAL:
        return this.userRefresh(refreshToken);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  private authenticateWeb3Stellar = async (token: string): Promise<any> => {
    throw new Error('Not implemented');
  };

  private makeRequest = async <T>(path: string, method: string, data?: any): Promise<T> => {
    const options: RequestInit = {
      method,
      headers: this.headers,
      body: data ? JSON.stringify(data) : null,
    };
    if (data) {
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
  private authenticateGoogle = async (token: string): Promise<any> => {
    this.setAuthToken(token);
    return this.makeRequest<any>('auth/google', 'POST', { token });
  };

  private authenticateGithub = async (code: string): Promise<any> => {
    this.setAuthToken(code);
    return this.makeRequest<any>('auth/github', 'POST', { code });
  };

  private refreshGoogleToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return this.makeRequest<RefreshTokenResponse>('auth/google/refresh', 'POST', {
      refresh_token: refreshToken,
    });
  };

  private exchangeGoogleCode = async (code: string): Promise<OAuth2ResponseDTO> => {
    return this.makeRequest<OAuth2ResponseDTO>('auth/google/exchange', 'POST', { code });
  };

  ////// Units API
  public createStorageUnit = async (data: CreateUnitRequest): Promise<CreateUnitResponse> => {
    return this.makeRequest<CreateUnitResponse>('unit', 'POST', data);
  };

  public getStorageUnits = async (): Promise<GetUnitsResponse> => {
    return this.makeRequest<GetUnitsResponse>('unit', 'GET', null);
  };

  public validateStorageUnit = async (
    unitId: string,
    data: ValidateUnitRequest
  ): Promise<ValidateUnitResponse> => {
    return this.makeRequest<ValidateUnitResponse>(`unit/${unitId}/validate`, 'POST', data);
  };

  public updateStorageUnit = async (
    unitId: string,
    data: UpdateUnitRequest
  ): Promise<UpdateUnitResponse> => {
    return this.makeRequest<UpdateUnitResponse>(`unit/${unitId}`, 'PUT', data);
  };

  public deleteStorageUnit = async (unitId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`unit/${unitId}`, 'DELETE', null);
  };

  public getAvailableStorageUnits = async (): Promise<StorageUnit[]> => {
    return this.makeRequest<StorageUnit[]>('unit/available', 'GET', null);
  };

  public getStorageUnitStatus = async (unitId: string): Promise<StorageUnitStatusResponse> => {
    return this.makeRequest<StorageUnitStatusResponse>(`unit/${unitId}/status`, 'GET', null);
  };

  public getUnitNodeStats = async (
    unitId: string,
    data: GetUnitNodeStatsRequest
  ): Promise<GetUnitNodeStatsResponse> => {
    return this.makeRequest<GetUnitNodeStatsResponse>(`unit/${unitId}/stats`, 'POST', data);
  };

  ////// Repos API
  public createStorageRepo = async (data: CreateRepoRequest): Promise<CreateRepoResponse> => {
    return this.makeRequest<CreateRepoResponse>('repo', 'POST', data);
  };

  public getStorageRepos = async (): Promise<GetReposResponse> => {
    return this.makeRequest<GetReposResponse>('repo', 'GET', null);
  };

  public updateStorageRepo = async (
    repoId: string,
    data: UpdateRepoRequest
  ): Promise<UpdateRepoResponse> => {
    return this.makeRequest<UpdateRepoResponse>(`repo/${repoId}`, 'PUT', data);
  };

  public deleteStorageRepo = async (repoId: string): Promise<ActionResponse> => {
    return this.makeRequest<ActionResponse>(`repo/${repoId}`, 'DELETE', null);
  };

  public validateNewRepoUnits = async (
    data: ValidateRepoUnitsRequest
  ): Promise<ValidateRepoUnitsResponse> => {
    return this.makeRequest<ValidateRepoUnitsResponse>('repo/validate', 'POST', data);
  };

  public validateUpdateRepoUnits = async (
    data: ValidateRepoUnitsRequest
  ): Promise<ValidateRepoUnitsResponse> => {
    return this.makeRequest<ValidateRepoUnitsResponse>(
      `repo/${data.repoId}/validate`,
      'POST',
      data
    );
  };

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

  ////// Stats API
  private validateDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate) {
      if (startDate > endDate) {
        throw new Error('startDate cannot be greater than endDate');
      }
    }
  }

  public getDailyStats = async (params: StatsQueryParams): Promise<StatsResponse> => {
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
    if (params.unitId && params.unitId.length > 0)
      queryParams.append('unitId', params.unitId.join(','));

    return this.makeRequest<StatsResponse>(`stats/daily?${queryParams.toString()}`, 'GET', null);
  };

  public getMinuteStats = async (params: StatsQueryParams): Promise<StatsResponse> => {
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
    if (params.unitId && params.unitId.length > 0)
      queryParams.append('unitId', params.unitId.join(','));

    return this.makeRequest<StatsResponse>(`stats/minute?${queryParams.toString()}`, 'GET', null);
  };

  public getNodeStatsMinute = async (
    params: NodeStatsQueryParams
  ): Promise<NodeStatsMinuteResponse> => {
    const queryParams = new URLSearchParams();
    if (params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
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
  };

  public getNodeStatsDaily = async (
    params: NodeStatsDailyQueryParams
  ): Promise<NodeStatsDailyResponse> => {
    const queryParams = new URLSearchParams();
    if (params.unitId.length > 0) {
      queryParams.append('unitId', params.unitId.join(','));
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
  };

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

  public getNodeInfo = async (): Promise<NodeInfo[]> => {
    return this.makeRequest<NodeInfo[]>('node', 'GET', null);
  };

  public sendFeedbackEmail = async (data: FeedbackEmailBody): Promise<ActionResponse> => {
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
}
