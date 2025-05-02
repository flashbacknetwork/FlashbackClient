export enum BucketStatusType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  DISCONNECTED = 'DISCONNECTED',
}

interface NodeSignedMessage {
  ip: string;
  region: string;
  timestamp: number;
  signature: string;
}

export interface BucketStatus {
  unitId: string;
  status: BucketStatusType;
  latency_ms?: number;
  createdAt: string;
}

export interface NodeStatusRequest extends NodeSignedMessage {
  buckets: BucketStatus[];
}

export interface NodeStatusResponse {
  nodeIP: string;
  buckets: BucketStatus[];
}

export interface RegisterRequest extends NodeSignedMessage {
  provider: string;
  status: string;
  region: string;
  version: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  error_code?: string;
  error_message?: string;
}
