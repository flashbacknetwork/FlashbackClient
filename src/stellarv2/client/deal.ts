import { ClientContext } from '.';
import { Deal, DealCreateParams, DealConsumptionUpdateParams, DealSLAUpdateParams } from '../models';
import { executeWalletTransaction, prepareTransaction } from '../wallet/transaction';
import { withSignature } from '../utils/decorator';

/**
 * Deal operations client for FlashOnStellar V2
 * Implements all deal-related contract methods
 */
export class DealOps {
  private context: ClientContext;

  constructor(context: ClientContext) {
    this.context = context;
  }

  /**
   * Creates a new deal between a consumer and provider
   * @param consumer_id - Address of the consumer creating the deal
   * @param provider_id - Address of the provider
   * @param bucket_id - ID of the bucket for the deal
   * @param params - Deal creation parameters
   * @returns Promise resolving to the created deal ID
   */
  createDeal = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      bucket_id: number,
      params: DealCreateParams
    ): Promise<number> => {
      const response = await prepareTransaction(this.context, consumer_id, {
        method: 'create_deal',
        args: [
          { value: consumer_id, type: 'address' },
          { value: provider_id, type: 'address' },
          { value: bucket_id, type: 'u32' },
          { value: params.duration_secs, type: 'u64' },
          { value: params.agreed_storage_gb, type: 'u32' },
          { value: params.agreed_egress_gb, type: 'u32' },
          { value: params.fb_repo_id, type: 'string' },
          { value: params.api_compatibility, type: 'string' }
        ]
      });

      if (!response.isSuccess) {
        throw new Error('Failed to create deal');
      }

      const result = response.result;
      if (typeof result === 'number') {
        return result;
      }
      throw new Error('Failed to create deal');
    }
  );

  /**
   * Sets a deal as accepted by the provider
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider accepting the deal
   * @param deal_id - ID of the deal to accept
   * @returns Promise resolving to the acceptance result
   */
  setDealAccepted = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "set_deal_accepted", [
        { value: consumer_id, type: 'address' },
        { value: provider_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Sets a deal as funded by the consumer
   * @param consumer_id - Address of the consumer funding the deal
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal to fund
   * @param amount_usd - Amount to fund in USD (scaled by 10^7)
   * @returns Promise resolving to the funding result
   */
  setDealFunded = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number,
      amount_usd: bigint
    ): Promise<void> => {
      await executeWalletTransaction(this.context, consumer_id, "set_deal_funded", [
        { value: provider_id, type: 'address' },
        { value: consumer_id, type: 'address' },
        { value: deal_id, type: 'u32' },
        { value: amount_usd, type: 'u128' }
      ]);
    }
  );

  /**
   * Sets a deal as completed
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal to complete
   * @returns Promise resolving to the completion result
   */
  setDealCompleted = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, consumer_id, "set_deal_completed", [
        { value: provider_id, type: 'address' },
        { value: consumer_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Sets a deal as cancelled
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal to cancel
   * @returns Promise resolving to the cancellation result
   */
  setDealCancelled = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "set_deal_cancelled", [
        { value: consumer_id, type: 'address' },
        { value: provider_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Marks a deal as breached by the consumer
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal
   * @returns Promise resolving to the breach marking result
   */
  setDealBreachedConsumer = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "set_deal_breached_consumer", [
        { value: consumer_id, type: 'address' },
        { value: provider_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Marks a deal as breached by the provider
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal
   * @returns Promise resolving to the breach marking result
   */
  setDealBreachedProvider = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, consumer_id, "set_deal_breached_provider", [
        { value: provider_id, type: 'address' },
        { value: consumer_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Deletes a deal from the system (owner only)
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal to delete
   * @returns Promise resolving to the deletion result
   */
  deleteDeal = withSignature(
    async (
      consumer_id: string,
      provider_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, '', "delete_deal", [
        { value: consumer_id, type: 'address' },
        { value: provider_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Retrieves deal information
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal to retrieve
   * @returns Promise resolving to Deal object or null if not found
   */
  async getDeal(
    consumer_id: string,
    provider_id: string,
    deal_id: number
  ): Promise<Deal | null> {
    const response = await prepareTransaction(this.context, consumer_id, {
      method: 'get_deal',
      args: [
        { value: consumer_id, type: 'address' },
        { value: provider_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]
    });

    if (!response.isSuccess) {
      return null;
    }

    const result = response.result;
    if (result && typeof result === 'object') {
      return result as Deal;
    }
    return null;
  }

  /**
   * Gets the total count of deals in the system
   * @returns Promise resolving to the total number of deals
   */
  async getDealCount(): Promise<number> {
    const response = await prepareTransaction(this.context, '', {
      method: 'get_deal_count',
      args: []
    });

    if (!response.isSuccess) {
      return 0;
    }

    const result = response.result;
    if (typeof result === 'number') {
      return result;
    }
    return 0;
  }

  /**
   * Retrieves a paginated list of all deals
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to an array of Deal objects
   */
  async getDeals(skip: number = 0, take: number = 10): Promise<Deal[]> {
    const response = await prepareTransaction(this.context, '', {
      method: 'get_deals',
      args: [
        { value: skip, type: 'u32' },
        { value: take, type: 'u32' }
      ]
    });

    if (!response.isSuccess) {
      return [];
    }

    const result = response.result;
    if (Array.isArray(result)) {
      return result as Deal[];
    }
    return [];
  }

  /**
   * Retrieves all deals for a specific consumer
   * @param consumer_id - Address of the consumer
   * @returns Promise resolving to an array of Deal objects
   */
  async getDealsByConsumer(consumer_id: string): Promise<Deal[]> {
    const response = await prepareTransaction(this.context, consumer_id, {
      method: 'get_deals_by_consumer',
      args: [
        { value: consumer_id, type: 'address' }
      ]
    });

    if (!response.isSuccess) {
      return [];
    }

    const result = response.result;
    if (Array.isArray(result)) {
      return result as Deal[];
    }
    return [];
  }

  /**
   * Retrieves all deals for a specific provider
   * @param provider_id - Address of the provider
   * @returns Promise resolving to an array of Deal objects
   */
  async getDealsByProvider(provider_id: string): Promise<Deal[]> {
    const response = await prepareTransaction(this.context, provider_id, {
      method: 'get_deals_by_provider',
      args: [
        { value: provider_id, type: 'address' }
      ]
    });

    if (!response.isSuccess) {
      return [];
    }

    const result = response.result;
    if (Array.isArray(result)) {
      return result as Deal[];
    }
    return [];
  }

  /**
   * Retrieves all active deals
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to an array of active Deal objects
   */
  async getActiveDeals(skip: number = 0, take: number = 10): Promise<Deal[]> {
    const response = await prepareTransaction(this.context, '', {
      method: 'get_active_deals',
      args: [
        { value: skip, type: 'u32' },
        { value: take, type: 'u32' }
      ]
    });

    if (!response.isSuccess) {
      return [];
    }

    const result = response.result;
    if (Array.isArray(result)) {
      return result as Deal[];
    }
    return [];
  }

  /**
   * Pays for pending consumption in a deal (owner only)
   * @param provider_id - Address of the provider
   * @param consumer_id - Address of the consumer
   * @param deal_id - ID of the deal
   * @returns Promise resolving to the payment result
   */
  payPendingConsumption = withSignature(
    async (
      provider_id: string,
      consumer_id: string,
      deal_id: number
    ): Promise<void> => {
      await executeWalletTransaction(this.context, '', "pay_pending_consumption", [
        { value: provider_id, type: 'address' },
        { value: consumer_id, type: 'address' },
        { value: deal_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Updates deal consumption metrics (owner only)
   * @param provider_id - Address of the provider
   * @param consumer_id - Address of the consumer
   * @param deal_id - ID of the deal
   * @param params - Consumption update parameters
   * @returns Promise resolving to the update result
   */
  updateDealConsumption = withSignature(
    async (
      provider_id: string,
      consumer_id: string,
      deal_id: number,
      params: DealConsumptionUpdateParams
    ): Promise<void> => {
      await executeWalletTransaction(this.context, '', "update_deal_consumption", [
        { value: provider_id, type: 'address' },
        { value: consumer_id, type: 'address' },
        { value: deal_id, type: 'u32' },
        { value: params.storage_gb, type: 'u32' },
        { value: params.egress_gb, type: 'u32' }
      ]);
    }
  );

  /**
   * Updates deal SLA metrics (owner only)
   * @param provider_id - Address of the provider
   * @param consumer_id - Address of the consumer
   * @param deal_id - ID of the deal
   * @param params - SLA update parameters
   * @returns Promise resolving to the update result
   */
  updateDealSLA = withSignature(
    async (
      provider_id: string,
      consumer_id: string,
      deal_id: number,
      params: DealSLAUpdateParams
    ): Promise<void> => {
      await executeWalletTransaction(this.context, '', "update_deal_sla", [
        { value: provider_id, type: 'address' },
        { value: consumer_id, type: 'address' },
        { value: deal_id, type: 'u32' },
        { value: params.sla_avg_latency_ms, type: 'u32' },
        { value: params.sla_avg_uptime_pct, type: 'u32' }
      ]);
    }
  );

  /**
   * Gets deal status information
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal
   * @returns Promise resolving to deal status or null if deal not found
   */
  async getDealStatus(
    consumer_id: string,
    provider_id: string,
    deal_id: number
  ): Promise<string | null> {
    const deal = await this.getDeal(consumer_id, provider_id, deal_id);
    if (!deal) {
      return null;
    }
    return deal.status;
  }

  /**
   * Gets deal balance information
   * @param consumer_id - Address of the consumer
   * @param provider_id - Address of the provider
   * @param deal_id - ID of the deal
   * @returns Promise resolving to deal balances or null if deal not found
   */
  async getDealBalances(
    consumer_id: string,
    provider_id: string,
    deal_id: number
  ): Promise<{
    balance_consumer: bigint;
    balance_provider: bigint;
  } | null> {
    const deal = await this.getDeal(consumer_id, provider_id, deal_id);
    if (!deal) {
      return null;
    }

    return {
      balance_consumer: deal.balance_consumer,
      balance_provider: deal.balance_provider
    };
  }
} 