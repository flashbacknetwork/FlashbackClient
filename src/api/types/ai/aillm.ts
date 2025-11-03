enum AiType {
  OPENAI = 'OPENAI',
  GOOGLE = 'GOOGLE',
  ANTHROPIC = 'ANTHROPIC',
  AWS = 'AWS',
  OTHER = 'OTHER',
}

export { AiType };

export interface CreateAiLlmRequest {
  name: string;
  aiType: AiType;
  endpoint: string;
  key?: string | null;
  secret: string;
  workspaceId: string;
}

export interface UpdateAiLlmRequest {
  name?: string;
  aiType?: AiType;
  endpoint?: string;
  key?: string | null;
  secret?: string;
}

export interface AiLlmDTO {
  id: string;
  orgId: string;
  workspaceId: string;
  userId: string;
  name: string;
  aiType: AiType;
  endpoint: string;
  key: string | null;
  createdAt: string;
  repos?: {
    id: string;
    name: string;
    createdAt: string;
  }[];
}

export interface GetAiLlmsResponse {
  success: boolean;
  aiLlms: AiLlmDTO[];
}

export interface CreateAiLlmResponse {
  success: boolean;
  aiLlmId: string;
  message?: string;
}

export interface UpdateAiLlmResponse {
  success: boolean;
  aiLlmId: string;
  message?: string;
}

export interface DeleteAiLlmResponse {
  success: boolean;
  message?: string;
}

export interface ValidateAiLlmResponse {
  success: boolean;
  message: string;
}

export interface AiLlmStatsResponse {
  success: boolean;
  stats: {
    aiLlmId: string;
    totalApiCalls: string;
    totalTokensIn: string;
    totalTokensOut: string;
    totalLlmTokensIn: string;
    totalLlmTokensOut: string;
    totalPolicyViolations: string;
    totalAlerts: string;
    totalBlocks: string;
  }[];
}

