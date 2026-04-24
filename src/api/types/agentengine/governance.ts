export interface OrgTokenBudget {
  id: string;
  org_id: string;
  daily_limit: number;
  monthly_limit: number;
  tokens_today: number;
  tokens_month: number;
  reset_day_at: string;
  reset_month_at: string;
  updated_at: string;
}

export interface GetOrgBudgetResponse {
  budget: OrgTokenBudget;
}

export interface SetOrgBudgetRequest {
  org_id: string;
  daily_limit?: number;
  monthly_limit?: number;
}

export interface SetOrgBudgetResponse {
  budget: OrgTokenBudget;
  message: string;
}

export interface ExecutionReceipt {
  id: string;
  flow_id: string;
  step_id: string;
  org_id: string;
  step_type: string;
  status: string;
  tokens_used?: number;
  duration_ms?: number;
  model_used?: string;
  cache_hit: boolean;
  error?: string;
  created_at: string;
}

export interface ListReceiptsQuery {
  org_id: string;
  flow_id?: string;
  limit?: number;
  offset?: number;
}

export interface ListReceiptsResponse {
  receipts: ExecutionReceipt[];
  count: number;
  page_tokens: number;
  page_duration_ms: number;
}

export interface SetTemplateTrustRequest {
  trust_tier: string;
}

export interface SetTemplateTrustResponse {
  template_id: string;
  trust_tier: string;
  message: string;
}
