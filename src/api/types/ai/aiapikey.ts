import { AiType } from './aillm';

export interface CreateRepoAiApiKeyRequest {
  name: string;
  aiType: AiType;
}

export interface UpdateRepoAiApiKeyRequest {
  name?: string;
}

export interface CreateRepoAiApiKeyResponse {
  success: boolean;
  id: string;
  key: string;
  secret: string;
  message?: string;
}

export interface RepoAiApiKeyDTO {
  id: string;
  name: string;
  repoId: string;
  key: string | null;
  aiType: AiType;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface GetRepoAiApiKeysResponse {
  success: boolean;
  apiKeys: RepoAiApiKeyDTO[];
}

export interface UpdateRepoAiApiKeyResponse {
  success: boolean;
  message: string;
}

export interface DeleteRepoAiApiKeyResponse {
  success: boolean;
  message: string;
}

