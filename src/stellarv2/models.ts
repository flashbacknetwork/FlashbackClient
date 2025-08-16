/**
 * TypeScript models for FlashOnStellar V2 contract
 * These models correspond to the Rust contract types
 */

export interface Consumer {
  consumer_id: string;
  description: string;
  reputation: number; // 0 to 100
  registered_ts: bigint;
  last_update_ts: bigint;
  deals: Map<string, bigint>; // deal_id -> storage_gb_used
  active_deals: Map<string, bigint>; // deal_id -> storage_gb_used
}

export interface Provider {
  provider_id: string;
  buckets: Map<string, bigint>; // bucket_id -> storage_gb_used
  deals: Map<string, bigint>; // deal_id -> storage_gb_used
  active_deals: Map<string, bigint>; // deal_id -> storage_gb_used
  description: string;
  reputation: number; // 0 to 100
  registered_ts: bigint;
  last_update_ts: bigint;
  units_count: number;
}

export interface Bucket {
  bucket_id: number; // per-provider unique ID
  name: string;
  region: string;
  country: string;
  provider_id: string;
  fb_bucket_id: string;
  price_per_gb_storage: bigint; // in usd * 10^7
  price_per_gb_egress: bigint; // in usd * 10^7
  max_storage_gb: number;
  max_egress_gb: number;
  versioning_enabled: boolean;
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
  object_locking: boolean;
  api_compatibility: string; // e.g. ["S3", "GCS"]
  sla_avg_latency_ms: number;
  sla_avg_uptime_pct: number; // e.g. 9990 = 99.90%
  access_scope: string; // "private" | "public-read" | etc.
  tags: string[];
  created_ts: bigint;
  status: BucketStatus;
  locked: boolean; // true when bucket is locked into an ongoing deal
}

export interface BucketMarketplace {
  bucket_id: number; // per-provider unique ID
  name: string;
  region: string;
  provider_id: string;
  provider_name: string;
  provider_reputation: string;
  fb_bucket_id: string;
  price_per_gb_storage: bigint; // in usd * 10^7
  price_per_gb_egress: bigint; // in usd * 10^7
  versioning_enabled: boolean;
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
  object_locking: boolean;
  api_compatibility: string; // e.g. ["S3", "GCS"]
  sla_avg_latency_ms: number;
  sla_avg_uptime_pct: number; // e.g. 99900000 = 99.90% (6 decimals)
  created_ts: bigint;
  status: BucketStatus;
  locked: boolean; // true when bucket is locked into an ongoing deal
}

export enum BucketStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export interface Deal {
  deal_id: number;
  consumer_id: string;
  provider_id: string;
  bucket_id: number;
  fb_repo_id: string;
  api_compatibility: string; // e.g. ["S3", "GCS"]
  start_ts: bigint;
  duration_secs: bigint;
  agreed_storage_gb: number;
  agreed_egress_gb: number;
  unpaid_storage_gb: number;
  unpaid_egress_gb: number;
  paid_storage_gb: number;
  paid_egress_gb: number;
  status: DealStatus;
  balance_consumer: bigint;
  balance_provider: bigint;
  sla_avg_latency_ms: number;
  sla_avg_uptime_pct: number;
  slash_storage_gb: number;
  slash_egress_gb: number;
  slash_amount_usd: bigint;
}

export enum DealStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Funded = 'Funded',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  BreachedConsumer = 'BreachedConsumer',
  BreachedProvider = 'BreachedProvider',
}

export enum DataKey {
  Owner = 'Owner',
  StableAssetAddress = 'StableAssetAddress',
  Provider = 'Provider',
  ProviderCount = 'ProviderCount',
  ProviderMap = 'ProviderMap',
  Consumer = 'Consumer',
  ConsumerCount = 'ConsumerCount',
  ConsumerMap = 'ConsumerMap',
  Bucket = 'Bucket',
  BucketCount = 'BucketCount',
  BucketMap = 'BucketMap',
  Deal = 'Deal',
  DealCount = 'DealCount',
  DealMap = 'DealMap',
  ActiveDealMap = 'ActiveDealMap',
}

export enum ErrorCode {
  ConsumerAlreadyExists = 'ConsumerAlreadyExists',
  ProviderAlreadyExists = 'ProviderAlreadyExists',
  BucketAlreadyExists = 'BucketAlreadyExists',
  BucketLocked = 'BucketLocked',
  // Add more error codes as needed
}

// Utility types for contract operations
export interface BucketCreateParams {
  name: string;
  region: string;
  fb_bucket_id: string;
  api_compatibility: string;
  price_per_gb_storage: bigint;
  price_per_gb_egress: bigint;
  sla_avg_latency_ms: number;
  sla_avg_uptime_pct: number;
}

export interface DealCreateParams {
  duration_secs: bigint;
  agreed_storage_gb: number;
  agreed_egress_gb: number;
  fb_repo_id: string;
  api_compatibility: string;
}

export interface BucketUpdateBasicParams {
  name?: string;
  region?: string;
  country?: string;
}

export interface BucketUpdateConditionsParams {
  name?: string;
  region?: string;
  price_per_gb_storage?: bigint;
  price_per_gb_egress?: bigint;
  sla_avg_latency_ms?: number;
  sla_avg_uptime_pct?: number;
}

export interface DealConsumptionUpdateParams {
  storage_gb: number;
  egress_gb: number;
}

export interface DealSLAUpdateParams {
  sla_avg_latency_ms: number;
  sla_avg_uptime_pct: number;
} 