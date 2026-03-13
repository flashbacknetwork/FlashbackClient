/**
 * Dashboard Statistics API – V2 Unified Interface
 *
 * Shared request/response DTOs for all dashboard statistics endpoints:
 *   Storage Gateway, AI Gateway, Private Chat, Policies, Credits.
 *
 * Naming conventions (standardised across all endpoints):
 *   - "requests"      – operation counts (never "apiCalls")
 *   - "tokensIn/Out"  – base model token usage
 *   - "policyTokensIn/Out" – overhead from policy-evaluation LLMs
 *   - "latencyMs"     – weighted-average latency across bridge nodes
 */

// ============================================================================
// ENUMS & LITERAL UNIONS
// ============================================================================

export type DashboardScope = 'org' | 'workspace' | 'repo';

export type DashboardWindow = '24h' | '7d' | '30d' | '90d' | '180d' | '365d';

export type DashboardTimeBucketSize =
  | '5m'
  | '10m'
  | '1h'
  | '6h'
  | '12h'
  | '1d';

export type StorageBreakdownBy =
  | 'workspaces'
  | 'repos'
  | 'buckets'
  | 'providers'
  | 'nodes';

export type AiBreakdownBy =
  | 'workspaces'
  | 'repos'
  | 'models'
  | 'providers'
  | 'nodes';

export type PrivateChatBreakdownBy = 'models' | 'users';

export type PolicyBreakdownBy = 'rules' | 'users';

export type CreditBreakdownBy =
  | 'workspaces'
  | 'repos'
  | 'models'
  | 'providers'
  | 'buckets';

// ============================================================================
// SHARED STRUCTURES
// ============================================================================

/** Standard statistical summary computed over the returned time-bucket values. */
export interface SummaryStats {
  total: number;
  avg: number;
  stdDev: number;
  min: number;
  max: number;
  p10: number;
  p50: number;
  p90: number;
}

/** Metadata returned with every time-series response. */
export interface TimeSeriesMeta {
  start: number;
  end: number;
  scope: DashboardScope;
  scopeId?: string;
  window: DashboardWindow;
  timeBucketSize: DashboardTimeBucketSize;
  resourceFilter?: {
    type: 'bucket' | 'model' | 'user' | 'node' | 'rule' | 'apiKey';
    id: string;
  };
}

/** Metadata returned with every breakdown response. */
export interface BreakdownMeta {
  start: number;
  end: number;
  scope: DashboardScope;
  scopeId?: string;
  breakdownBy: string;
  includesSeries: boolean;
  limit: number;
  offset: number;
  totalEntities: number;
}

// ============================================================================
// GENERIC RESPONSE ENVELOPES
// ============================================================================

/**
 * Standard time-series response.
 * `TPoint` carries per-bucket metric fields **plus** `ts` (and optional `entityId`).
 */
export interface TimeSeriesResponse<TPoint> {
  success: boolean;
  meta: TimeSeriesMeta;
  summary: SummaryStats;
  series: TPoint[];
  message?: string;
  error_code?: string;
}

/** A single entity inside a breakdown response. */
export interface BreakdownEntity<TTotals> {
  entityId: string;
  entityName?: string;
  totals: TTotals;
  series?: Array<{ ts: number } & TTotals>;
}

/** Standard breakdown response. */
export interface BreakdownResponse<TTotals> {
  success: boolean;
  meta: BreakdownMeta;
  summary: { total: number };
  entities: BreakdownEntity<TTotals>[];
  message?: string;
  error_code?: string;
}

// ============================================================================
// QUERY PARAMETER INTERFACES
// ============================================================================

/** Base query parameters shared by all main time-series endpoints. */
export interface DashboardStatsQueryParams {
  scope: DashboardScope;
  id?: string;
  window: DashboardWindow;
}

/** Base query parameters shared by all breakdown endpoints. */
export interface DashboardBreakdownQueryParams {
  scope?: DashboardScope;
  id?: string;
  window: DashboardWindow;
  includeSeries?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// 1. STORAGE GATEWAY
// ============================================================================

export interface StorageMetrics {
  uplBytes: number;
  dwlBytes: number;
  sizeChange: number;
  latencyMs: number;
  requests: number;
}

export interface StorageTimeSeriesPoint extends StorageMetrics {
  ts: number;
  entityId?: string;
}

/** GET /v2/stats/storage?scope=...&id=...&window=...&bucketId=... */
export interface StorageStatsQueryParams extends DashboardStatsQueryParams {
  bucketId?: string;
}

export type StorageTimeSeriesResponse = TimeSeriesResponse<StorageTimeSeriesPoint>;

export type StorageBreakdownResponse = BreakdownResponse<StorageMetrics>;

/** Specialised entity for the storage-provider breakdown (protocol + endpoint). */
export interface StorageProviderEntity extends BreakdownEntity<StorageMetrics> {
  protocol?: string;
  provider?: string;
  endpoint?: string;
}

export interface StorageProviderBreakdownResponse {
  success: boolean;
  meta: BreakdownMeta;
  summary: { total: number };
  entities: StorageProviderEntity[];
  message?: string;
  error_code?: string;
}

// ============================================================================
// 2. AI GATEWAY
// ============================================================================

export interface AiGatewayMetrics {
  tokensIn: number;
  tokensOut: number;
  policyTokensIn: number;
  policyTokensOut: number;
  requests: number;
  activeConversations: number;
  latencyMs: number;
}

export interface AiGatewayTimeSeriesPoint extends AiGatewayMetrics {
  ts: number;
  entityId?: string;
}

/** GET /v2/stats/ai?scope=...&id=...&window=...&model=...&apiKeyId=... */
export interface AiGatewayStatsQueryParams extends DashboardStatsQueryParams {
  model?: string;
  apiKeyId?: string;
}

export type AiGatewayTimeSeriesResponse = TimeSeriesResponse<AiGatewayTimeSeriesPoint>;

export type AiGatewayBreakdownResponse = BreakdownResponse<AiGatewayMetrics>;

// ============================================================================
// 3. PRIVATE CHAT
// ============================================================================

export interface PrivateChatMetrics {
  tokensIn: number;
  tokensOut: number;
  requests: number;
}

export interface PrivateChatTimeSeriesPoint extends PrivateChatMetrics {
  ts: number;
  entityId?: string;
}

/**
 * GET /v2/stats/private-chat?scope=...&id=...&window=...&model=...&userId=...&apiKeyId=...
 *
 * `model`, `userId`, and `apiKeyId` are resource-level filters that narrow the
 * time-series to a single model, user, or API key respectively.
 */
export interface PrivateChatStatsQueryParams extends DashboardStatsQueryParams {
  model?: string;
  userId?: string;
  apiKeyId?: string;
}

export type PrivateChatTimeSeriesResponse = TimeSeriesResponse<PrivateChatTimeSeriesPoint>;

export type PrivateChatModelBreakdownResponse = BreakdownResponse<PrivateChatMetrics>;

/** Extended totals returned for users (includes conversation metadata). */
export interface PrivateChatUserTotals extends PrivateChatMetrics {
  conversationsCount: number;
  lastActiveAt?: number;
}

export interface PrivateChatUserEntity {
  entityId: string;
  entityName?: string;
  totals: PrivateChatUserTotals;
  series?: Array<{ ts: number } & PrivateChatMetrics>;
}

export interface PrivateChatUsersBreakdownResponse {
  success: boolean;
  meta: BreakdownMeta;
  summary: { total: number };
  entities: PrivateChatUserEntity[];
  message?: string;
  error_code?: string;
}

// ============================================================================
// 4. POLICIES
// ============================================================================

export interface PolicyEnforcementMetrics {
  violations: number;
  alerts: number;
  blocks: number;
  severityLow: number;
  severityMedium: number;
  severityHigh: number;
}

export interface PolicyTokenMetrics {
  policyTokensIn: number;
  policyTokensOut: number;
}

export interface PolicyMetrics extends PolicyEnforcementMetrics, PolicyTokenMetrics {}

export interface PolicyTimeSeriesPoint extends PolicyMetrics {
  ts: number;
  entityId?: string;
}

/** GET /v2/stats/policies?scope=...&id=...&window=...&ruleId=...&apiKeyId=... */
export interface PolicyStatsQueryParams extends DashboardStatsQueryParams {
  ruleId?: string;
  apiKeyId?: string;
}

export type PolicyTimeSeriesResponse = TimeSeriesResponse<PolicyTimeSeriesPoint>;

/**
 * Dedicated policy-token time-series endpoint:
 * GET /v2/stats/policies/tokens?scope=...&id=...&window=...
 */
export interface PolicyTokenTimeSeriesPoint extends PolicyTokenMetrics {
  ts: number;
}

export type PolicyTokenTimeSeriesResponse = TimeSeriesResponse<PolicyTokenTimeSeriesPoint>;

export type PolicyBreakdownResponse = BreakdownResponse<PolicyEnforcementMetrics>;

// ============================================================================
// 5. CREDITS
// ============================================================================

export interface CreditMetrics {
  creditsAi: number;
  creditsStorage: number;
  creditsTotal: number;
  creditsPurchased: number;
  creditsGranted: number;
}

export interface CreditTimeSeriesPoint extends CreditMetrics {
  ts: number;
  entityId?: string;
}

/** GET /v2/stats/credits?scope=...&id=...&window=...&apiKeyId=... */
export interface CreditStatsQueryParams extends DashboardStatsQueryParams {
  apiKeyId?: string;
}

export type CreditTimeSeriesResponse = TimeSeriesResponse<CreditTimeSeriesPoint>;

export type CreditBreakdownResponse = BreakdownResponse<CreditMetrics>;
