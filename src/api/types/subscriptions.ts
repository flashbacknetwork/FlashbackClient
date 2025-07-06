export interface SubscriptionPeriodResponse {
  id: string;
  subscriptionId: string;
  periodType: string;
  price: number;
}

export interface SubscriptionResponse {
  id: string;
  name: string;
  description: string;
  periods: SubscriptionPeriodResponse[];
}

export interface BuySubscriptionRequest {
  subscriptionPeriodId: string;
}

export interface BuySubscriptionResponse {
  success: boolean;
  clientSecret?: string;
  sessionId?: string;
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