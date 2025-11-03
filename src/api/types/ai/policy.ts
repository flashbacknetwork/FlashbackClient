export enum RiskType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface CreatePolicyRequest {
  name: string;
  content: string;
  riskType: RiskType;
  actionType: number;
  orgId: string;
  workspaceId?: string | null;
  repoId?: string | null;
}

export interface UpdatePolicyRequest {
  name?: string;
  content?: string;
  riskType?: RiskType;
  actionType?: number;
}

export interface GetPoliciesQuery {
  orgId: string;
  workspaceId?: string | null;
  repoId?: string | null;
}

export interface PolicyDTO {
  id: string;
  orgId: string;
  name: string;
  content: string;
  riskType: RiskType;
  actionType: number;
  createdBy: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  lastUpdatedBy: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  lastUpdatedAt: Date;
  workspaceId: string | null;
  repoId: string | null;
  workspace?: {
    id: string;
    name: string;
  } | null;
  repo?: {
    id: string;
    name: string;
  } | null;
}

export interface GetPolicyViolationsQuery {
  workspaceId?: string;
  repoId?: string;
  policyId?: string;
  from?: string;
  to?: string;
  take?: number;
  skip?: number;
}

export interface PolicyViolationDTO {
  id: string;
  policyId: string;
  policyName: string;
  timestamp: Date;
  explanation: string;
  conversationId: string | null;
  repoId: string;
  repoName: string;
  userId: string;
  userName: string;
  repoAiApiKeyId: string;
  repoAiApiKeyName: string;
}

export interface GetPolicyViolationsResponse {
  success: boolean;
  violations: PolicyViolationDTO[];
  total: number;
  skip: number;
  take: number;
}

