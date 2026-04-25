import type { JsonObject } from './common';

export type FlowStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  /** Phase 13: terminal status when the flow exceeds its max_execution_minutes deadline. */
  | 'timed_out';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  /** Phase 12: step exceeded its per-step timeout (in-process or watchdog). */
  | 'timed_out'
  /** Phase 12: transient state while sleeping between retry attempts. */
  | 'retrying';

export type StepType = 'tool_call' | 'code_exec' | 'llm_think' | 'map_reduce' | 're_plan';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonObject;
  serviceId: string;
  providerId: string;
  permissions?: string[];
  estimatedDurationMs?: number;
}

export interface FlowStep {
  id: string;
  flow_id: string;
  type: StepType;
  tool_name?: string;
  status: StepStatus;
  input: JsonObject;
  output?: JsonObject;
  depends_on: string[];
  description: string;
  error?: string;
  code?: string;
  snippet_id?: string;
  sandbox_image?: string;
  llm_prompt?: string;
  llm_model?: string;
  started_at?: string;
  completed_at?: string;
  map_over?: string;
  map_step_type?: StepType;
  reduce_prompt?: string;
  reduce_code?: string;
  max_concurrency?: number;
  on_item_error?: string;
}

export interface FlowPlan {
  id: string;
  org_id: string;
  user_id: string;
  repo_id?: string;
  template_id?: string;
  status: FlowStatus;
  execution_source?: string;
  user_prompt: string;
  steps: FlowStep[];
  summary: string;
  max_tokens?: number;
  tokens_used?: number;
  max_steps?: number;
  artifacts?: string[];
  max_replan_iterations?: number;
  replan_count?: number;
  // Phase 5: conversation threading
  conversation_id?: string;
  parent_plan_id?: string;
  /** Phase 13: per-flow override of max_execution_minutes; falls back to template/config default. */
  max_execution_minutes?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Response shape from presenter.FormatPlanJSON (structured, JSON-friendly).
 */
export type FlowPlanView = JsonObject;
