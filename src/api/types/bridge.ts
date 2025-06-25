export enum NodeStatusType {
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

export interface NodeStatusInfo {
  ip: string;
  region: string;
  version: string;
  status: NodeStatusType;
  latencyMs?: number;
  lastUpdated: string;
}

export interface BucketStatus {
  unitId: string;
  status: NodeStatusType;
  latencyMs?: number;
  createdAt: string;
}

export interface NodeStatusRequest extends NodeSignedMessage {
  buckets: BucketStatus[];
}

export interface NodeStatusResponse extends RegisterResponse {}

export interface RegisterRequest extends NodeSignedMessage {
  provider: string;
  status: string;
  region: string;
  version: string;
  id_org?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface NodeInfo {
  ip: string;
  region: string;
  version: string;
  status: string;
  latencyMs?: number;
  lastUpdated: string;
  url: string;
}