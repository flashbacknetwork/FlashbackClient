export type CloudResourceGroupingLevel = 'GROUPING' | 'CONTAINER';

export interface CloudResourceGroupingTypeRefDto {
  id: string;
  name: string;
  level: CloudResourceGroupingLevel;
}

/**
 * The CONTAINER-level grouping (AWS account / GCP project / Azure subscription)
 * that owns a cloud resource. Optional because legacy resources discovered
 * before the hierarchical-grouping migration may not have one attached.
 */
export interface ContainerRefDto {
  id: string;
  name: string;
  providerGroupingId: string;
  groupingType: CloudResourceGroupingTypeRefDto;
}

export interface CloudResourceDto {
  id: string;
  repoId: string;
  providerId: string;
  categoryId: string;
  categoryName?: string;
  apiKeyId?: string | null;
  apiKeyDescription?: string | null;
  resourceProviderId: string;
  name: string;
  region: string;
  accessLevel: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  discoveredAt: string;
  lastSeenAt: string;
  /** CONTAINER-level grouping owning this resource (account/project/subscription). */
  container?: ContainerRefDto | null;
  /** Human-readable breadcrumb of the grouping ancestry, e.g. "AWS Org / Marketing OU / Marketing-Prod". */
  groupingPath?: string;
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
export * from './groupings';
export * from './providers';
