import type { JsonObject } from './common';

export type FlowStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

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
  created_at: string;
  updated_at: string;
}

/**
 * Response shape from presenter.FormatPlanJSON (structured, JSON-friendly).
 */
export type FlowPlanView = JsonObject;
