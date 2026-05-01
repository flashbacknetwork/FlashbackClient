import type { JsonObject } from './common';
import type { ScheduleLog } from './schedule';

/** Fine-tune guardrail overrides shared by templates and scheduled tasks. */
export interface FineTuneParams {
  /** Per-run input token cap on top of the org budget. Null = inherit. */
  token_budget_in?: number | null;
  /** Per-run output token cap. Null = inherit. */
  token_budget_out?: number | null;
  /** Total LLM token cap per run. Null = inherit. */
  max_tokens?: number | null;
  /** Max flow steps. Null = inherit. */
  max_steps?: number | null;
  /** Flow timeout ceiling in minutes. Null = inherit. */
  max_execution_minutes?: number | null;
  /** Max scheduled-run retries on failure. Null = inherit. */
  max_retries?: number | null;
  /** Max mid-execution re-plan iterations. Null = inherit. */
  max_replan_iterations?: number | null;
  /** Per-step timeout in seconds. Null = inherit. */
  step_timeout_seconds?: number | null;
  /** Concurrent step count cap. Null = inherit. */
  max_parallel_steps?: number | null;
  /** Code corrector LLM retry count. Null = inherit. */
  code_exec_max_revisions?: number | null;
  /** Tool-call retry count. Null = inherit. */
  max_tool_call_revisions?: number | null;
}

export interface ScheduledTask extends FineTuneParams {
  id: string;
  org_id: string;
  user_id?: string;
  template_id: string;
  name: string;
  description?: string;
  cron_schedule: string;
  parameters?: JsonObject;
  auto_approve: boolean;
  active: boolean;
  // Execution tracking
  last_run_at?: string;
  consecutive_failures: number;
  total_executions: number;
  total_successes: number;
  last_success_at?: string;
  last_failure_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledTaskRequest extends FineTuneParams {
  org_id: string;
  user_id?: string;
  template_id: string;
  name: string;
  description?: string;
  cron_schedule: string;
  parameters?: JsonObject;
  auto_approve?: boolean;
  active?: boolean;
}

export type UpdateScheduledTaskRequest = Partial<
  Omit<CreateScheduledTaskRequest, 'org_id' | 'template_id'>
>;

export interface ListScheduledTasksQuery {
  org_id: string;
  template_id?: string;
  active?: boolean;
  limit?: number;
}

export interface ListScheduledTasksResponse {
  tasks: ScheduledTask[];
}

export interface GetScheduledTaskResponse {
  task: ScheduledTask;
}

export interface CreateScheduledTaskResponse {
  task: ScheduledTask;
  message: string;
}

export interface UpdateScheduledTaskResponse {
  task: ScheduledTask;
  message: string;
}

export interface GetScheduledTaskLogsResponse {
  logs: ScheduleLog[];
}
