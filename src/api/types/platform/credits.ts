/**
 * Credits API request/response DTOs
 */

// ---- Balance ----

export interface CreditBalanceData {
  creditBalance: number;
  dateBalance: string | null;
  realtimeBalance: number;
  pendingConsumption: number;
  breakdown: {
    storage: number;
    ai: number;
  };
}

export interface GetCreditsBalanceResponse {
  success: boolean;
  data?: CreditBalanceData;
  error_code?: string;
  message?: string;
}

// ---- Transactions ----

export type CreditTransactionType = 'consumption' | 'purchase' | 'grant';

export interface CreditTransactionItem {
  id: string;
  creditAmount: number;
  createdAt: string;
  description: string | null;
  type: CreditTransactionType;
  rateType?: string;
  rateConcept?: string;
  rateUsed?: number;
  repoId?: string;
  unitId?: string;
  host?: string;
  llmType?: string;
  llmModel?: string;
  subscriptionName?: string;
  packName?: string;
}

export interface CreditTransactionsPagination {
  total: number;
  page: number;
  limit: number;
}

export interface GetCreditsTransactionsRequest {
  page?: number;
  limit?: number;
  direction?: 'in' | 'out' | 'all';
  startDate?: string;
  endDate?: string;
  repoId?: string;
}

export interface GetCreditsTransactionsResponse {
  success: boolean;
  data?: CreditTransactionItem[];
  pagination?: CreditTransactionsPagination;
  error_code?: string;
  message?: string;
}

// Consumption uses same endpoint as transactions with direction='out'
export type GetCreditsConsumptionRequest = GetCreditsTransactionsRequest;
export type GetCreditsConsumptionResponse = GetCreditsTransactionsResponse;

// ---- Buy pack ----

export interface BuyCreditsPackRequest {
  packId: string;
}

export interface BuyCreditsPackResponse {
  success: boolean;
  checkoutUrl?: string | null;
  sessionId?: string;
  error_code?: string;
  message?: string;
  nextAvailableAt?: string;
}

// ---- Packs list ----

export interface CreditPackItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  price: number;
}

export interface GetCreditsPacksResponse {
  success: boolean;
  data?: CreditPackItem[];
  error_code?: string;
  message?: string;
}

// ---- Rates list ----

export interface CreditRateItem {
  id: string;
  type: string;
  typeCode: string;
  concept: string;
  conceptCode: string;
  unit: string | null;
  rate: number;
}

export interface GetCreditsRatesResponse {
  success: boolean;
  data?: CreditRateItem[];
  error_code?: string;
  message?: string;
}

// ---- Monthly stats (for histogram) ----

export interface MonthlyCreditsStatsItem {
  /** ISO date string for first day of month, e.g. "2025-01-01T00:00:00.000Z" */
  month: string;
  /** Credits consumed (as positive number for display, from negative transactions) */
  consumption: number;
  /** Credits from pack purchases */
  purchases: number;
  /** Credits from subscription grants */
  grants: number;
  /** Net change: grants + purchases - consumption */
  balance: number;
}

export interface GetCreditsMonthlyStatsRequest {
  /** Number of months to return (default 12, max 24) */
  months?: number;
}

export interface GetCreditsMonthlyStatsResponse {
  success: boolean;
  data?: MonthlyCreditsStatsItem[];
  totals?: {
    consumption: number;
    purchases: number;
    grants: number;
    balance: number;
  };
  error_code?: string;
  message?: string;
}
