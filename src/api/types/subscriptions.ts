import { PeriodType } from "./quota";

export interface SubscriptionPeriodResponse {
  id: string;
  subscriptionId: string;
  periodType: string;
  price: number;
}

export interface SubscriptionCapability {
  id: string;
  code: string;
  description: string;
  type: string;
  price: number;
  periodType: PeriodType;
  value: number;
}

export interface SubscriptionResponse {
  id: string;
  name: string;
  description: string;
  periods: SubscriptionPeriodResponse[];
  capabilities: SubscriptionCapability[];
}

export interface BuySubscriptionRequest {
  subscriptionPeriodId: string;
}

export interface BuySubscriptionResponse {
  success: boolean;
  checkoutUrl?: string;  // Stripe's hosted checkout URL
  sessionId?: string;    // Keep for tracking/debugging
  message?: string;
  error_code?: string;
}

export interface OrgSubscriptionResponse {
  id: string;
  name: string;
  description: string;
  periodId: string;
  periodType: string;
  price: number;
  dateFrom: string;
  dateTo: string | null;
  status: string;
  autoRenew: boolean;
}

export interface MySubscriptionResponse {
  success: boolean;
  data: OrgSubscriptionResponse | null;
  message?: string;
}

export interface GetSubscriptionsResponse {
  success: boolean;
  data: SubscriptionResponse[];
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
}

export interface PaymentsListResponse {
  success: boolean;
  data?: PaymentResponse[];
  message?: string;
  error_code?: string;
}

export interface PaymentsQueryParams {
  startDate?: string;
  endDate?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  error_code?: string;
} 

export interface CreateBillingPortalResponse {
  success: boolean;
  url?: string;
  message?: string;
  error_code?: string;
}

export interface GetCheckoutSessionStatusResponse {
  success: boolean;
  id?: string;
  status?: string | null;
  payment_status?: string | null;
  subscriptionId?: string | null;
  message?: string;
  error_code?: string;
}