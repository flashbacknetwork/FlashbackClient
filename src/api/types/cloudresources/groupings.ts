import type { CloudResourceGroupingLevel } from './index';

export interface RepoGroupingDto {
  id: string;
  name: string;
  providerGroupingId: string;
  groupingTypeId: string;
  groupingTypeName: string;
  level: CloudResourceGroupingLevel;
  parentId: string | null;
  apiKeyId: string | null;
  groupingPath: string;
}

export interface ListRepoGroupingsQuery {
  apiKeyId?: string;
  level?: CloudResourceGroupingLevel;
}

export interface ListRepoGroupingsResponse {
  success: boolean;
  groupings: RepoGroupingDto[];
}
