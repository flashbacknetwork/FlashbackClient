import type { CloudResourceGroupingLevel } from './index';

export interface ProviderGroupingTypeDto {
  id: string;
  name: string;
  level: CloudResourceGroupingLevel;
}

export interface ProviderDto {
  id: string;
  name: string;
  capabilities: number;
  groupingTypes: ProviderGroupingTypeDto[];
}

export interface ListProvidersResponse {
  success: boolean;
  providers: ProviderDto[];
}
