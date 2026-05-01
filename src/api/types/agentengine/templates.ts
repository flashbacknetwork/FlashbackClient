import type { JsonObject } from './common';
import type { FlowPlan } from './flow';

export interface Template {
  id: string;
  org_id: string;
  user_id: string;
  repo_id?: string;
  name: string;
  description: string;
  prompt: string;
  parameters?: JsonObject;
  schedule?: string;
  auto_approve: boolean;
  active: boolean;
  /** "system" | "user" | "cloud_discovery" */
  template_type?: string;
  max_retries?: number;
  max_tokens?: number;
  max_steps?: number;
  max_replan_iterations?: number;
  use_blueprint: boolean;
  cloud_provider?: string;
  plan_blueprint?: FlowPlan;
  last_run_at?: string;
  /** Ceiling on total flow runtime in minutes. Unset → engine default. */
  max_execution_minutes?: number;
  /** Per-run input token cap (on top of org budget). Null = inherit global. */
  token_budget_in?: number | null;
  /** Per-run output token cap. Null = inherit global. */
  token_budget_out?: number | null;
  /** Per-step timeout override in seconds. Null = inherit global. */
  step_timeout_seconds?: number | null;
  /** Concurrent step count override. Null = inherit global. */
  max_parallel_steps?: number | null;
  /** Code corrector LLM retry override. Null = inherit global. */
  code_exec_max_revisions?: number | null;
  /** Tool-call retry override. Null = inherit global. */
  max_tool_call_revisions?: number | null;
  /** ID of the ad-hoc run this template was promoted from, if any. */
  source_plan_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentTemplateRequest {
  name: string;
  description: string;
  prompt: string;
  parameters?: JsonObject;
  org_id: string;
  user_id: string;
  repo_id?: string;
  schedule?: string;
  auto_approve: boolean;
  /** "system" | "user" | "cloud_discovery". Defaults to "user". */
  template_type?: string;
  max_retries?: number;
  max_tokens?: number;
  max_steps?: number;
  max_replan_iterations?: number;
  use_blueprint: boolean;
  cloud_provider?: string;
  max_execution_minutes?: number;
  token_budget_in?: number | null;
  token_budget_out?: number | null;
  step_timeout_seconds?: number | null;
  max_parallel_steps?: number | null;
  code_exec_max_revisions?: number | null;
  max_tool_call_revisions?: number | null;
  source_plan_id?: string | null;
}

export interface UpdateAgentTemplateRequest {
  name?: string;
  description?: string;
  prompt?: string;
  parameters?: JsonObject;
  schedule?: string;
  auto_approve?: boolean;
  active?: boolean;
  repo_id?: string;
  max_retries?: number;
  max_tokens?: number;
  max_steps?: number;
  max_replan_iterations?: number;
  use_blueprint?: boolean;
  max_execution_minutes?: number;
  /** Pass null to clear a previously-set override (inherit from global). */
  token_budget_in?: number | null;
  token_budget_out?: number | null;
  step_timeout_seconds?: number | null;
  max_parallel_steps?: number | null;
  code_exec_max_revisions?: number | null;
  max_tool_call_revisions?: number | null;
}

export interface ListAgentTemplatesQuery {
  org_id: string;
  limit?: number;
  offset?: number;
}

export interface ListAgentTemplatesResponse {
  templates: Template[];
}

export interface GetAgentTemplateResponse {
  template: Template;
}

export interface CreateAgentTemplateResponse {
  template: Template;
  message: string;
}

export interface UpdateAgentTemplateResponse {
  template: Template;
  message: string;
}

export interface DeleteAgentTemplateResponse {
  message: string;
}

export interface RefreshAgentTemplateBlueprintRequest {
  parameters?: JsonObject;
}

export interface RefreshAgentTemplateBlueprintResponse {
  template: Template;
  message: string;
}

export interface PromoteAgentPlanRequest {
  name: string;
  description?: string;
}

export interface PromoteAgentPlanResponse {
  template: Template;
  message: string;
}
