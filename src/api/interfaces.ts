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
    UpdateRepoKeyResponse
} from "./types/storage";

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
    createRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>;
    getRepos(): Promise<GetReposResponse>;
    updateRepo(repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse>;
    deleteRepo(repoId: string): Promise<ActionResponse>;
    createRepoKey(data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse>;
    getRepoKeys(repoId: string): Promise<GetRepoKeysResponse>;
    updateRepoKey(repoId: string, data: UpdateRepoKeyRequest): Promise<UpdateRepoKeyResponse>;
    deleteRepoKey(repoId: string, keyId: string): Promise<ActionResponse>;
}