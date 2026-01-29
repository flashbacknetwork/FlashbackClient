export interface CreateConversationRequest {
  repoId: string;
}

export interface CreateConversationResponse {
  success: boolean;
  conversationId?: string;
  message?: string;
}

export interface SendPromptRequest {
  prompt: string;
  model: string;
}

export interface SendPromptResponse {
  success: boolean;
  message?: string;
  // Additional fields can be added here when implementing the external API integration
}

export interface GetConversationsRequest {
  take?: number;
  skip?: number;
  from?: string; // ISO date string
  to?: string; // ISO date string
  userId?: string;
  workspaceId?: string;
  repoId?: string;
  showDeleted?: boolean;
}

export interface GetConversationMessagesRequest {
  take?: number;
  skip?: number;
}

export interface ConversationDTO {
  id: string;
  orgId: string;
  createdBy: string;
  createdAt: string;
  lastUpdatedAt: string;
  workspaceId: string;
  repoId: string;
  tokensIn: string; // BigInt as string
  tokensOut: string; // BigInt as string
  deletedAt?: string | null; // ISO date string
  repo?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  title?: string;
}

export interface GetConversationsResponse {
  success: boolean;
  conversations: ConversationDTO[];
  total: number;
  message?: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  tokenCount?: number;
  model?: string;
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO date string
}

export interface GetConversationMessagesResponse {
  success: boolean;
  messages: MessageDTO[];
  message?: string;
  title?: string;
}

export interface DeleteConversationRequest {
  conversationId: string;
  hardDelete: boolean;
}

export interface DeleteConversationResponse {
  success: boolean;
  message?: string;
}

