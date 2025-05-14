import { StorageUnit, 
    StorageRepo, 
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
} from "./types/storage";
import { RegisterBody, LoginBody, RegisterResponse, LoginResponse, RefreshResponse, LogoutResponse, ActivateResponse, DeactivateResponse } from "./types/auth";

export enum ProviderType {
    GOOGLE = 'GOOGLE',
    GITHUB = 'GITHUB',
    WEB3_STELLAR = 'WEB3_STELLAR',
}

export interface IApiClient {
    authenticate(token: string, provider: ProviderType): Promise<any>;
    createStorageUnit(data: CreateUnitRequest): Promise<CreateUnitResponse>;
    getStorageUnits(): Promise<GetUnitsResponse>;
    updateStorageUnit(unitId: string, data: UpdateUnitRequest): Promise<UpdateUnitResponse>;
    deleteStorageUnit(unitId: string): Promise<ActionResponse>;
    validateStorageUnit(unitId: string, data: ValidateUnitRequest): Promise<ValidateUnitResponse>;
    getAvailableStorageUnits(): Promise<StorageUnit[]>;
    createStorageRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>;
    getStorageRepos(): Promise<GetReposResponse>;
    updateStorageRepo(repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse>;
    deleteStorageRepo(repoId: string): Promise<ActionResponse>;
    createRepoKey(data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse>;
    getRepoKeys(repoId: string): Promise<GetRepoKeysResponse>;
    updateRepoKey(repoId: string, keyId: string, data: UpdateRepoKeyRequest): Promise<UpdateRepoKeyResponse>;
    deleteRepoKey(repoId: string, keyId: string): Promise<ActionResponse>;
    validateNewRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>;
    validateUpdateRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>;
    userRegister(registerBody: RegisterBody): Promise<RegisterResponse>;
    userLogin(loginBody: LoginBody): Promise<LoginResponse>;
    userRefresh(refreshToken: string): Promise<RefreshResponse>;
    userLogout(refreshToken: string): Promise<LogoutResponse>;
    userActivate(): Promise<ActivateResponse>;
    userDeactivate(): Promise<DeactivateResponse>;
}