import type { JsonObject } from './common';
import type { FlowPlanView } from './flow';

export interface CreateAgentPlanRequest {
  prompt: string;
  parameters?: JsonObject;
  template_id?: string;
  org_id: string;
  user_id: string;
  repo_id?: string;
  api_key_id?: string;
  repo_api_key?: string;
  service_credentials?: Record<string, string>;
  max_tokens?: number;
  max_steps?: number;
  max_replan_iterations?: number;
  /** Phase 13: per-plan override of max_execution_minutes; falls back to template/config default. */
  max_execution_minutes?: number;
  // Phase 5: conversational follow-up
  parent_plan_id?: string;
  conversation_id?: string;
  // Phase 9: bypass the gap detector when the caller has already resolved
  // ambiguity (e.g. internal automation, tests, clarification follow-up).
  skip_clarification?: boolean;
  session_id?: string;
}

export interface ValidationIssue {
  step_id: string;
  tool_name: string;
  severity: string;
  message: string;
}

export interface AgentPlanValidation {
  valid: boolean;
  issues?: ValidationIssue[];
}

export interface CreateAgentPlanResponse {
  plan: FlowPlanView;
  validation: AgentPlanValidation;
  markdown: string;
}

export interface GetAgentPlanResponse {
  plan: FlowPlanView;
  markdown: string;
}

export interface ListAgentPlansQuery {
  org_id: string;
  limit?: number;
  offset?: number;
}

export interface ListAgentPlansResponse {
  plans: FlowPlanView[];
}

export interface ApproveAgentPlanRequest {
  service_credentials?: Record<string, string>;
}

export interface ApproveAgentPlanResponse {
  message: string;
  flow_id: string;
  status: string;
}

export interface RejectAgentPlanResponse {
  message: string;
  flow_id: string;
  status: string;
}

// Phase 2 (SSH safety): per-step approval gate. The Binder flags steps
// targeting a key whose Description matches /(prod|production|live)/i with
// requires_explicit_approval=true; the executor pauses on those steps and
// transitions the flow to status `step_approval`. The dashboard surfaces
// the gate to the user, who clicks Approve or Reject per step.
export interface ApproveAgentStepResponse {
  message: string;
  flow_id: string;
  step_id: string;
  status: string;
}

export interface RejectAgentStepResponse {
  message: string;
  flow_id: string;
  step_id: string;
  status: string;
}

export interface ConversationTurn {
  plan_id: string;
  parent_plan_id?: string;
  user_prompt: string;
  summary: string;
  status: string;
  step_count: number;
  created_at: string;
}

export interface GetConversationResponse {
  conversation_id: string;
  turns: ConversationTurn[];
  count: number;
}
