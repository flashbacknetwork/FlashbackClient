export interface CloudResourceDto {
  id: string;
  repoId: string;
  providerId: string;
  categoryId: string;
  resourceProviderId: string;
  name: string;
  region: string;
  accessLevel: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  discoveredAt: string;
  lastSeenAt: string;
}

export interface UpsertCloudResourcesRequest {
  repoId: string;
  resources: Array<{
    providerId: string;
    categoryName: string;
    resourceProviderId: string;
    name: string;
    region?: string;
    accessLevel?: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface UpsertCloudResourcesResponse {
  success: boolean;
  message: string;
}

export interface ListCloudResourcesQuery {
  categoryName?: string;
  name?: string;
}

export interface ListCloudResourcesResponse {
  success: boolean;
  resources: CloudResourceDto[];
}

export * from './tree';
