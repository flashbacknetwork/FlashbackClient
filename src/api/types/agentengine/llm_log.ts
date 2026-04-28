// Per-flow LLM call log DTO (GET /v1/agent/plan/:id/llm_log, migration 026).
//
// Returns every LLM call recorded against a flow, grouped by the dashboard's
// three layers, with per-layer + grand totals. Each event row is an
// ExecutionReceipt with its layer/operation/split-tokens fields populated.

import type { ExecutionReceipt } from './governance';

export interface FlowLLMLogTotals {
  prompt: number;
  completion: number;
  cached_prompt: number;
  total: number;
  cost_usd_micros: number;
  calls: number;
}

export interface GetFlowLLMLogResponse {
  planning: ExecutionReceipt[];
  execution: ExecutionReceipt[];
  post_execution: ExecutionReceipt[];
  /** Receipts with an unknown / future layer value. Almost always empty. */
  other: ExecutionReceipt[];
  totals_by_layer: {
    planning: FlowLLMLogTotals;
    execution: FlowLLMLogTotals;
    post_execution: FlowLLMLogTotals;
  };
  totals: FlowLLMLogTotals;
}
