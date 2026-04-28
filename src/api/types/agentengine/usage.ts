// Aggregate LLM token + cost reporting DTOs (migration 026).
//
// Cost is in USD micros (1e-6 USD); divide by 1_000_000 for display.

export interface UsageWindow {
  from: string;
  to: string;
  prompt: number;
  completion: number;
  cached_prompt: number;
  total: number;
  cost_usd_micros: number;
  calls: number;
}

export interface GetUsageSummaryQuery {
  org_id: string;
  /** Optional: restrict the aggregate to a single repo. Omit for whole-org totals. */
  repo_id?: string;
}

export interface GetUsageSummaryResponse {
  windows: {
    '24h': UsageWindow;
    '7d': UsageWindow;
    '30d': UsageWindow;
  };
}

export interface UsageReportRow {
  /** UTC calendar day, YYYY-MM-DD. Days with zero activity are omitted. */
  day: string;
  prompt: number;
  completion: number;
  cached_prompt: number;
  total: number;
  cost_usd_micros: number;
  calls: number;
}

export interface UsageTotals {
  prompt: number;
  completion: number;
  cached_prompt: number;
  total: number;
  cost_usd_micros: number;
  calls: number;
}

export interface GetUsageReportQuery {
  org_id: string;
  repo_id?: string;
  /** RFC3339; defaults to now-30d on the server. */
  from?: string;
  /** RFC3339; defaults to now on the server. */
  to?: string;
  /** Filter to a single LLM model id, e.g. "gpt-4o". */
  model?: string;
}

export interface GetUsageReportResponse {
  from: string;
  to: string;
  rows: UsageReportRow[];
  totals: UsageTotals;
}
