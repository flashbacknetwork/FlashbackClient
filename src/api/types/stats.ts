export interface StatsQueryParams {
  startDate?: Date;
  endDate?: Date;
  repoId?: string[];
  unitId?: string[];
}

export interface StatsResponse {
  success: boolean;
  data: StatsData[];
  message?: string;
}

export interface StatsData {
  timestamp: number;
  repoId: string;
  unitId: string;
  upl_bytes: bigint;
  dwl_bytes: bigint;
  size_change: bigint;
  latency_ms: number;
}

// Node stats interfaces
export interface NodeStatsMinuteResponse {
  success: boolean;
  data: NodeStatsMinuteData[];
  message?: string;
}

export interface NodeStatsMinuteData {
  nodeId: string;
  unitId: string;
  nodeStatus: string;
  lastUpdated: Date;
  latency_ms: number;
}

export interface NodeStatsDailyResponse {
  success: boolean;
  data: NodeStatsDailyData[];
  message?: string;
}

export interface NodeStatsDailyData {
  nodeId: string;
  unitId: string;
  day: number;
  online: number;
  latency_ms: number;
  endpoint: string;
  region: string;
  storageType: string;
  provider: string;
  status: string;
  version: string;
}

export interface NodeStatsQueryParams {
  unitId: string[];
}

export interface NodeStatsDailyQueryParams {
  unitId: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface RepoStatsResponse {
  success: boolean;
  stats: {
    repoId: string;
    totalUploadBytes: string;
    totalDownloadBytes: string;
    totalSizeChange: string;
  }[];
}

export interface UnitStatsResponse {
  success: boolean;
  stats: {
    unitId: string;
    totalCount: string;
    totalUploadBytes: string;
    totalDownloadBytes: string;
    totalSizeChange: string;
  }[];
}
