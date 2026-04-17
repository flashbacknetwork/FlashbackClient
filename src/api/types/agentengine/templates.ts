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
  max_retries?: number;
  max_tokens?: number;
  max_steps?: number;
  max_replan_iterations?: number;
  use_blueprint: boolean;
  cloud_provider?: string;
  plan_blueprint?: FlowPlan;
  last_run_at?: string;
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
  max_retries?: number;
  max_tokens?: number;
  max_steps?: number;
  max_replan_iterations?: number;
  use_blueprint: boolean;
  cloud_provider?: string;
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
