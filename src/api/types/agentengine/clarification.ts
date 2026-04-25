import type { JsonObject } from './common';

export interface ClarificationOption {
  id: string;
  label: string;
  recommended?: boolean;
  pros?: string[];
  cons?: string[];
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  context?: string;
  options: ClarificationOption[];
  allow_other: boolean;
  multi_select: boolean;
}

export interface ClarificationAnswer {
  question_id: string;
  selected_ids: string[];
  custom_text?: string;
}

export type PlanSessionStatus = 'pending' | 'answered' | 'expired' | 'skipped';

/**
 * Returned from `createAgentPlan` (HTTP 202) when the gap detector decides
 * the prompt is too ambiguous to plan yet. The caller must render the
 * questions, collect answers, and call `submitClarification` (or
 * `skipClarification`) to receive a real plan.
 */
export interface NeedsClarificationResponse {
  status: 'needs_clarification';
  session_id: string;
  questions: ClarificationQuestion[];
  expires_at: string; // ISO 8601
}

export interface PlanSession {
  id: string;
  org_id: string;
  user_id?: string;
  repo_id?: string;
  template_id?: string;
  original_prompt: string;
  parameters?: JsonObject;
  questions: ClarificationQuestion[];
  answers: ClarificationAnswer[] | null;
  status: PlanSessionStatus;
  expires_at: string;
  created_at: string;
}

export interface GetPlanSessionResponse {
  session: PlanSession;
}

export interface SubmitClarificationRequest {
  session_id: string;
  answers: ClarificationAnswer[];
}

export interface SkipClarificationRequest {
  session_id: string;
}
