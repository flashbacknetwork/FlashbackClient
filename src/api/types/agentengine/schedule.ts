import type { JsonObject } from './common';
import type { StepStatus, StepType } from './flow';

export interface StepExecutionDetail {
  step_id: string;
  type: StepType;
  description: string;
  status: StepStatus;
  error?: string;
  output?: JsonObject;
  duration_ms?: number;
}

export interface ScheduleLog {
  id: string;
  template_id: string;
  /**
   * Set when the run was triggered from a scheduled_tasks row (Phase 14+).
   * Empty/undefined for manual UI runs and ad-hoc runs.
   */
  scheduled_task_id?: string;
  flow_id: string;
  execution_source?: string;
  parameters?: JsonObject;
  triggered_at: string;
  status: string;
  summary?: string;
  execution_details?: StepExecutionDetail[];
  retry_count?: number;
  next_retry_at?: string;
  artifacts?: string[];
  // Migration 026: per-flow LLM totals aggregated from execution_receipts.
  // Zero for flows that did no LLM work or pre-026 rows. cost_usd_micros is
  // USD * 1e6; divide by 1_000_000 for display.
  prompt_tokens: number;
  completion_tokens: number;
  cached_prompt_tokens: number;
  total_tokens: number;
  cost_usd_micros: number;
}

export interface ListAgentTemplateLogsQuery {
  limit?: number;
  offset?: number;
}

export interface GetAgentTemplateLogsResponse {
  logs: ScheduleLog[];
}

// Ad-hoc runs (flows with no template_id). Same row shape as template logs
// so the dashboard can render both lists with the same component.
export interface ListAdHocLogsQuery {
  org_id: string;
  /** Optional: restrict the list to runs that targeted a specific repo. */
  repo_id?: string;
  limit?: number;
  offset?: number;
}

export interface ListAdHocLogsResponse {
  logs: ScheduleLog[];
}
