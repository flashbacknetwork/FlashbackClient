/**
 * Chat-mode (conversational UI) types for FlashAgentEngine.
 *
 * Sessions are scoped per (org, workspace, repo, user). A session can only be
 * accessed while its repo is the active context in the dashboard; cross-repo
 * access returns 404 from the engine.
 */

import type { ClarificationOption } from './clarification';

/**
 * Scope tuple every chat call must carry. The engine validates each request
 * against (org_id, repo_id, user_id) and returns 404 for cross-tuple access.
 * workspace_id is required at session creation but is not part of the access
 * check (a session belongs to a single repo within a workspace).
 */
export interface ChatScope {
  orgId: string;
  repoId: string;
  userId: string;
  workspaceId?: string;
}

export type ChatSessionSource = 'adhoc' | 'template';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

/** Discriminator on agent_chat_messages.kind. */
export type ChatMessageKind =
  | 'text'
  | 'question'
  | 'answer'
  | 'plan_ref'
  | 'narration_summary';

export interface ChatSession {
  id: string;
  org_id: string;
  workspace_id: string;
  repo_id: string;
  user_id: string;
  title?: string;
  agent_environment_id?: string;
  source: ChatSessionSource;
  template_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  org_id: string;
  repo_id: string;
  user_id: string;
  turn_id: string;
  role: ChatMessageRole;
  kind: ChatMessageKind;
  content?: string;
  plan_id?: string;
  clarification_session_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/** Body for POST /v1/agent/chat/sessions. */
export interface CreateChatSessionRequest {
  title?: string;
  workspace_id: string;
  repo_id: string;
  agent_environment_id?: string;
  source?: ChatSessionSource;
  template_id?: string;
}

export interface CreateChatSessionResponse {
  conversation_id: string;
  session: ChatSession;
}

export interface ListChatSessionsResponse {
  sessions: ChatSession[];
  next_cursor?: string;
}

export interface GetChatSessionResponse {
  session: ChatSession;
  messages: ChatMessage[];
}

/** Body for POST /v1/agent/chat/sessions/:id/messages. */
export interface PostChatMessageRequest {
  text: string;
  attachments?: Array<Record<string, unknown>>;
  template_params?: Record<string, unknown>;
  /**
   * When true (default in the dashboard chat UI), FAE will auto-approve the
   * generated plan and start execution. Per-step approval gates still apply.
   */
  auto_approve?: boolean;
}

export interface PostChatMessageResponse {
  message_id: string;
  turn_id: string;
}

/** Body for POST .../messages/:turn_id/answers. */
export interface AnswerChatQuestionRequest {
  question_id: string;
  selected_ids?: string[];
  custom_text?: string;
}

export interface AnswerChatQuestionResponse {
  status: 'accepted';
}

/** SSE event types emitted on the chat stream. */
export type ChatEventType =
  | 'phase'
  | 'question'
  | 'plan_draft'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'step_progress'
  | 'narration'
  | 'assistant_message'
  | 'done';

export type ChatPhase =
  | 'classifying'
  | 'clarifying'
  | 'planning'
  | 'executing'
  | 'answering'
  | 'done';

export interface ChatPhasePayload {
  phase: ChatPhase;
}

export interface ChatQuestionPayload {
  question_id: string;
  prompt: string;
  kind: string;
  options?: ClarificationOption[];
  default?: string;
  role?: string;
}

export interface ChatStepEventPayload {
  step_id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  description?: string;
}

export interface ChatStepProgressPayload {
  step_id: string;
  message: string;
  progress_pct?: number;
}

export interface ChatNarrationPayload {
  step_id?: string;
  text: string;
}

export interface ChatAssistantMessagePayload {
  message_id: string;
  content: string;
  citations?: string[];
}

export interface ChatDonePayload {
  turn_id: string;
  plan_id?: string;
  status?: string;
}

/**
 * Generic envelope. The Type field discriminates the Payload shape; consumers
 * should narrow on `event.type` (or the SSE `event:` field) before reading.
 */
export interface ChatEvent {
  conversation_id: string;
  turn_id: string;
  type: ChatEventType;
  plan_id?: string;
  step_id?: string;
  payload?:
    | ChatPhasePayload
    | ChatQuestionPayload
    | ChatStepEventPayload
    | ChatStepProgressPayload
    | ChatNarrationPayload
    | ChatAssistantMessagePayload
    | ChatDonePayload
    | unknown;
  timestamp: string;
  event_id?: number;
}
