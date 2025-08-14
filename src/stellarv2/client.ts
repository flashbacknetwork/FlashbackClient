import { StellarNetwork } from './transaction';
import { ConsumerOps } from './consumer';
import { ProviderOps } from './provider';
import { BucketOps } from './bucket';
import { DealOps } from './deal';
import { FundingOps } from './funding';

/**
 * Configuration interface for the FlashOnStellar V2 client
 */
export interface FlashOnStellarClientConfigV2 {
  /** Stellar contract address for the FlashOnStellar V2 system */
  contractAddress: string;
  /**
   * Optional callback function to sign non-read Stellar transactions
   * @param xdrToSign - The XDR-encoded transaction to sign
   * @returns Promise resolving to the signed XDR string
   */
  signTransaction?: (xdrToSign: string) => Promise<string>;
  /** Network configuration for Stellar (testnet/public) */
  network: StellarNetwork;
}

export type ClientContext = FlashOnStellarClientConfigV2;

/**
 * Main client class for interacting with the FlashOnStellar V2 system
 * This client provides methods for managing providers, consumers, buckets, and deals
 * on the Stellar blockchain through organized operation classes.
 */
export class FlashOnStellarClientV2 {
  private readonly signTransaction?: (xdrToSign: string) => Promise<string>;
  private readonly contractAddress: string;
  private readonly network: StellarNetwork;

  // Operation classes
  public readonly consumers: ConsumerOps;
  public readonly providers: ProviderOps;
  public readonly buckets: BucketOps;
  public readonly deals: DealOps;
  public readonly funding: FundingOps;

  protected getContext(): ClientContext {
    return {
      network: this.network,
      signTransaction: this.signTransaction,
      contractAddress: this.contractAddress,
    };
  }

  /**
   * Creates a new instance of the FlashOnStellarClient
   * @param config - Configuration options for the client
   */
  constructor(config: FlashOnStellarClientConfigV2) {
    this.signTransaction = config.signTransaction;
    this.contractAddress = config.contractAddress;
    this.network = config.network;

    // Initialize operation classes
    const context = this.getContext();
    this.consumers = new ConsumerOps(context);
    this.providers = new ProviderOps(context);
    this.buckets = new BucketOps(context);
    this.deals = new DealOps(context);
    this.funding = new FundingOps(context);
  }

  /**
   * Gets the contract address
   * @returns The contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Gets the network configuration
   * @returns The network configuration
   */
  getNetwork(): StellarNetwork {
    return this.network;
  }

  /**
   * Gets the version of the contract
   * @returns Promise resolving to the contract version
   */
  async getVersion(): Promise<number> {
    // This would call the version() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('getVersion not implemented - requires transaction layer implementation');
  }

  /**
   * Gets the owner address of the contract
   * @returns Promise resolving to the owner address
   */
  async getOwnerAddress(): Promise<string> {
    // This would call the get_owner_address() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('getOwnerAddress not implemented - requires transaction layer implementation');
  }

  /**
   * Gets the stable asset address from the contract
   * @returns Promise resolving to the stable asset address
   */
  async getStableAssetAddress(): Promise<string> {
    // This would call the get_stable_asset_address() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('getStableAssetAddress not implemented - requires transaction layer implementation');
  }

  /**
   * Gets the current ledger sequence
   * @returns Promise resolving to the ledger sequence number
   */
  async getLedgerSequence(): Promise<number> {
    // This would call the get_ledger_sequence() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('getLedgerSequence not implemented - requires transaction layer implementation');
  }

  /**
   * Updates the owner address (owner only)
   * @param new_owner - New owner address
   * @returns Promise resolving to the update result
   */
  async updateOwner(new_owner: string): Promise<boolean> {
    // This would call the update_owner() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('updateOwner not implemented - requires transaction layer implementation');
  }

  /**
   * Sets the stable asset address (owner only)
   * @param stable_asset_address - New stable asset address
   * @returns Promise resolving to the update result
   */
  async setStableAssetAddress(stable_asset_address: string): Promise<boolean> {
    // This would call the set_stable_asset_address() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('setStableAssetAddress not implemented - requires transaction layer implementation');
  }

  /**
   * Upgrades the contract (owner only)
   * @param new_wasm_hash - Hash of the new WASM bytecode
   * @returns Promise resolving to the upgrade result
   */
  async upgrade(new_wasm_hash: string): Promise<boolean> {
    // This would call the upgrade() method on the contract
    // Implementation depends on the transaction layer
    throw new Error('upgrade not implemented - requires transaction layer implementation');
  }

  /**
   * Gets system statistics
   * @returns Promise resolving to system statistics
   */
  async getSystemStats(): Promise<{
    consumerCount: number;
    providerCount: number;
    bucketCount: number;
    dealCount: number;
    activeDealCount: number;
  }> {
    try {
      const [consumerCount, providerCount, bucketCount, dealCount] = await Promise.all([
        this.consumers.getConsumerCount(),
        this.providers.getProviderCount(),
        this.buckets.getBucketCount(),
        this.deals.getDealCount()
      ]);

      // Get active deals count
      const activeDeals = await this.deals.getActiveDeals(0, 1000); // Get all active deals
      const activeDealCount = activeDeals.length;

      return {
        consumerCount,
        providerCount,
        bucketCount,
        dealCount,
        activeDealCount
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        consumerCount: 0,
        providerCount: 0,
        bucketCount: 0,
        dealCount: 0,
        activeDealCount: 0
      };
    }
  }

  /**
   * Gets comprehensive information about a provider including their buckets and deals
   * @param provider_id - Address of the provider
   * @returns Promise resolving to comprehensive provider information
   */
  async getProviderInfo(provider_id: string): Promise<{
    provider: any;
    buckets: any[];
    deals: any[];
    activeDeals: any[];
  } | null> {
    try {
      const [provider, buckets, deals, activeDeals] = await Promise.all([
        this.providers.getProvider(provider_id),
        this.buckets.getBucketsByProvider(provider_id),
        this.deals.getDealsByProvider(provider_id),
        this.deals.getActiveDeals(0, 1000) // Get all active deals and filter by provider
      ]);

      if (!provider) {
        return null;
      }

      // Filter active deals for this provider
      const providerActiveDeals = activeDeals.filter(deal => deal.provider_id === provider_id);

      return {
        provider,
        buckets,
        deals,
        activeDeals: providerActiveDeals
      };
    } catch (error) {
      console.error('Error getting provider info:', error);
      return null;
    }
  }

  /**
   * Gets comprehensive information about a consumer including their deals
   * @param consumer_id - Address of the consumer
   * @returns Promise resolving to comprehensive consumer information
   */
  async getConsumerInfo(consumer_id: string): Promise<{
    consumer: any;
    deals: any[];
    activeDeals: any[];
  } | null> {
    try {
      const [consumer, deals, activeDeals] = await Promise.all([
        this.consumers.getConsumer(consumer_id),
        this.deals.getDealsByConsumer(consumer_id),
        this.deals.getActiveDeals(0, 1000) // Get all active deals and filter by consumer
      ]);

      if (!consumer) {
        return null;
      }

      // Filter active deals for this consumer
      const consumerActiveDeals = activeDeals.filter(deal => deal.consumer_id === consumer_id);

      return {
        consumer,
        deals,
        activeDeals: consumerActiveDeals
      };
    } catch (error) {
      console.error('Error getting consumer info:', error);
      return null;
    }
  }

  /**
   * Gets comprehensive information about a bucket including its provider and any active deals
   * @param provider_id - Address of the provider
   * @param bucket_id - ID of the bucket
   * @returns Promise resolving to comprehensive bucket information
   */
  async getBucketInfo(provider_id: string, bucket_id: number): Promise<{
    bucket: any;
    provider: any;
    activeDeals: any[];
  } | null> {
    try {
      const [bucket, provider, activeDeals] = await Promise.all([
        this.buckets.getBucket(provider_id, bucket_id),
        this.providers.getProvider(provider_id),
        this.deals.getActiveDeals(0, 1000) // Get all active deals and filter by bucket
      ]);

      if (!bucket) {
        return null;
      }

      // Filter active deals for this bucket
      const bucketActiveDeals = activeDeals.filter(deal => deal.bucket_id === bucket_id);

      return {
        bucket,
        provider,
        activeDeals: bucketActiveDeals
      };
    } catch (error) {
      console.error('Error getting bucket info:', error);
      return null;
    }
  }
}
