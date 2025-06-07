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
  repo?: {
    id: string;
    name: string;
    orgId: string;
    deletedAt: Date | null;
  };
  unit?: {
    id: string;
    name: string;
    deletedAt: Date | null;
  };
} 