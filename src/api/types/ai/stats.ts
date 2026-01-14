export interface AiStatsQueryParams {
  startDate?: Date;
  endDate?: Date;
  repoId?: string[];
  aiLlmId?: string[];
  repoAiApiKeyId?: string[];
  hosts?: string[];
}

export interface AiStatsResponse {
  success: boolean;
  data: AiStatsData[];
  message?: string;
}

export interface AiStatsData {
  timestamp: number;
  repoId: string;
  aiLlmId: string;
  repoAiApiKeyId: string;
  tokensIn: bigint | string;
  tokensOut: bigint | string;
  llmTokensIn: bigint | string;
  llmTokensOut: bigint | string;
  activeConversations: number;
  apiCalls: number;
  policyViolations: number;
  numAlerts: number;
  numBlocks: number;
  latency_ms: number;
  llmType: string;
  llmModel: string;
  host: string;
}
