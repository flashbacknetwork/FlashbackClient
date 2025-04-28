export enum BucketStatusType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
}

export interface BucketStatus {
  unitId: string;
  status: BucketStatusType;
  latency_ms?: number;
  createdAt: string;
}

export interface BucketStatusResponse {
  nodeIP: string;
  buckets: BucketStatus[];
}

