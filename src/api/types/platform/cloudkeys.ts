/** Association between a storage repo and an org/workspace cloud provider API key. */
export interface RepoCloudApiKeyDTO {
  id: string;
  repoId: string;
  apiKeyId: string;
  createdAt: string;
  /** Enriched from JOIN — provider name e.g. 'AWS', 'GCP', 'AZURE' */
  provider: string;
  /** Non-sensitive display prefix of the key */
  keyPrefix: string;
  region?: string;
  endpoint?: string;
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
