export interface CloudResourceTreeResourceDTO {
  id: string;
  name: string;
  resourceProviderId: string;
  region: string | null;
  accessLevel: string | null;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  discoveredAt: string;
  lastSeenAt: string | null;
}

export interface CloudResourceTreeCategoryDTO {
  id: string;
  name: string;
  description: string | null;
  resources: CloudResourceTreeResourceDTO[];
}

export interface CloudResourceTreeApiKeyDTO {
  id: string;
  description: string | null;
  provider: string;
  region: string | null;
  endpoint: string | null;
  keyPrefix: string;
  categories: CloudResourceTreeCategoryDTO[];
}

export interface GetRepoCloudResourcesTreeResponse {
  success: boolean;
  repoId: string;
  apiKeys: CloudResourceTreeApiKeyDTO[];
}
