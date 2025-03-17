import { StorageUnit, 
    StorageRepo, 
    CreateUnitRequest, 
    CreateUnitResponse, 
    CreateRepoRequest, 
    CreateRepoResponse, 
    CreateRepoKeyRequest, 
    CreateRepoKeyResponse, 
    ApiKey 
} from "./types";

export enum ProviderType {
    GOOGLE = 'GOOGLE',
    GITHUB = 'GITHUB',
    WEB3_STELLAR = 'WEB3_STELLAR',
}

export interface IApiClient {
    authenticate(token: string, provider: ProviderType): Promise<any>;
    createStorageUnit(data: CreateUnitRequest): Promise<CreateUnitResponse>;
    getStorageUnits(): Promise<StorageUnit[]>;
    createRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>;
    getRepos(): Promise<StorageRepo[]>;
    createRepoKey(data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse>;
    getRepoKeys(repoId: string): Promise<ApiKey[]>;
}