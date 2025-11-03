export enum PeriodType {
    ALL_TIME = 'ALL_TIME',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
  }
  
export interface SubscriptionInfo {
    id: string;
    name: string;
    description: string;
  }
  
  export interface CapabilityInfo {
    id: string;
    code: string;
    description: string;
    type: string; // Capability type from database (e.g., 'STORAGE', 'TRAFFIC', etc.)
    periodType: PeriodType;
  }
  
  export interface QuotaUsageInfo {
    current: number;
    max: number;
    percentage: number;
  }
  
  export interface QuotaUsageItem {
    capability: CapabilityInfo;
    usage: QuotaUsageInfo;
  }
  
  export interface QuotaResponse {
    success: boolean;
    subscription: SubscriptionInfo;
    quotaUsage: QuotaUsageItem[];
  }
  