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
