/** Association between a storage repo and an org/workspace cloud provider API key. */
export interface RepoCloudApiKeyDTO {
  id: string;
  repoId: string;
  apiKeyId: string;
  createdAt: string;
}

export interface AddRepoCloudApiKeyRequest {
  repoId: string;
  apiKeyId: string;
}

export interface AddRepoCloudApiKeyResponse {
  success: boolean;
  id: string;
}

export interface ListRepoCloudApiKeysResponse {
  success: boolean;
  items: RepoCloudApiKeyDTO[];
}
