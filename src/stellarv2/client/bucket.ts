import { ClientContext } from '.';
import { Bucket, BucketCreateParams, BucketUpdateBasicParams, BucketUpdateConditionsParams } from '../models';
import { ContractMethodResponse, executeWalletTransaction, prepareTransaction } from '../wallet/transaction';
import { withSignature } from '../utils/decorator';

/**
 * Bucket operations client for FlashOnStellar V2
 * Implements all bucket-related contract methods
 */
export class BucketOps {
  private context: ClientContext;

  constructor(context: ClientContext) {
    this.context = context;
  }

  /**
   * Creates a new bucket for a provider
   * @param provider_id - Address of the provider creating the bucket
   * @param params - Bucket creation parameters
   * @returns Promise resolving to the created bucket ID
   */
  createBucket = withSignature(
    async (provider_id: string, params: BucketCreateParams): Promise<number> => {
      const response: ContractMethodResponse = await executeWalletTransaction(this.context, provider_id, "create_bucket", [
          { value: params.name, type: 'string' },
          { value: params.region, type: 'string' },
          { value: params.fb_bucket_id, type: 'string' },
          { value: params.api_compatibility, type: 'string' },
          { value: params.price_per_gb_storage, type: 'u128' },
          { value: params.price_per_gb_egress, type: 'u128' },
          { value: params.sla_avg_latency_ms, type: 'u32' },
          { value: params.sla_avg_uptime_pct, type: 'u32' }
        ]);

      if (!response.isSuccess) {
        throw new Error('Failed to create bucket');
      }

      const result = response.result;
      if (typeof result === 'number') {
        return result;
      }
      throw new Error('Failed to create bucket');
    }
  );

  /**
   * Creates a bucket from an existing bucket object
   * @param bucket - Existing bucket object to clone
   * @returns Promise resolving to the created bucket ID
   */
  /*
  createFromBucket = withSignature(
    async (bucket: Bucket): Promise<number> => {
      const response = await prepareTransaction(this.context, bucket.provider_id, {
        method: 'create_from_bucket',
        args: [
          { value: bucket, type: 'string' } // Note: This might need adjustment based on how the contract expects the bucket parameter
        ]
      });

      if (!response.isSuccess) {
        throw new Error('Failed to create bucket from existing bucket');
      }

      const result = response.result;
      if (typeof result === 'number') {
        return result;
      }
      throw new Error('Failed to create bucket from existing bucket');
    }
  );
  */

  /**
   * Updates basic bucket information (name, region, country)
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to update
   * @param params - Basic update parameters
   * @returns Promise resolving to the update result
   */
  updateBucketBasic = withSignature(
    async (
      provider_id: string,
      bucket_id: number,
      params: BucketUpdateBasicParams
    ): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "update_bucket_basic", [
        { value: bucket_id, type: 'u32' },
        { value: params.name || null, type: 'string' },
        { value: params.region || null, type: 'string' },
        { value: params.country || null, type: 'string' }
      ]);
    }
  );

  /**
   * Updates bucket pricing and capacity information
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to update
   * @param params - Pricing update parameters
   * @returns Promise resolving to the update result
   */
  updateBucketConditions = withSignature(
    async (
      provider_id: string,
      bucket_id: number,
      params: BucketUpdateConditionsParams
    ): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "update_bucket_conditions", [
        { value: bucket_id, type: 'u32' },
        { value: params.price_per_gb_storage || null, type: 'u128' },
        { value: params.price_per_gb_egress || null, type: 'u128' },
        { value: params.sla_avg_latency_ms || null, type: 'u32' },
        { value: params.sla_avg_uptime_pct || null, type: 'u32' }
      ]);
    }
  );

  /**
   * Locks a bucket to prevent modifications during active deals
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to lock
   * @returns Promise resolving to the lock result
   */
  lockBucket = withSignature(
    async (provider_id: string, bucket_id: number): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "lock_bucket", [
        { value: bucket_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Unlocks a bucket to allow modifications
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to unlock
   * @returns Promise resolving to the unlock result
   */
  unlockBucket = withSignature(
    async (provider_id: string, bucket_id: number): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "unlock_bucket", [
        { value: bucket_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Deletes a bucket from the system
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to delete
   * @returns Promise resolving to the deletion result
   */
  deleteBucket = withSignature(
    async (provider_id: string, bucket_id: number): Promise<void> => {
      await executeWalletTransaction(this.context, provider_id, "delete_bucket", [
        { value: bucket_id, type: 'u32' }
      ]);
    }
  );

  /**
   * Retrieves bucket information
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to retrieve
   * @returns Promise resolving to Bucket object or null if not found
   */
  async getBucket(provider_id: string, bucket_id: number): Promise<Bucket | null> {
    const response = await prepareTransaction(this.context, provider_id, {
      method: 'get_bucket',
      args: [
        { value: bucket_id, type: 'u32' }
      ]
    });

    if (!response.isSuccess) {
      return null;
    }

    const result = response.result;
    if (result && typeof result === 'object') {
      return result as Bucket;
    }
    return null;
  }

  /**
   * Gets the total count of buckets in the system
   * @returns Promise resolving to the total number of buckets
   */
  async getBucketCount(): Promise<number> {
    const response = await prepareTransaction(this.context, '', {
      method: 'get_bucket_count',
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
   * Retrieves a paginated list of all buckets
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to an array of Bucket objects
   */
  async getBuckets(skip: number = 0, take: number = 10): Promise<Bucket[]> {
    const response = await prepareTransaction(this.context, '', {
      method: 'get_buckets',
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
      return result as Bucket[];
    }
    return [];
  }

  /**
   * Retrieves all buckets owned by a specific provider
   * @param provider_id - Address of the provider
   * @returns Promise resolving to an array of Bucket objects
   */
  async getBucketsByProvider(provider_id: string): Promise<Bucket[]> {
    const response = await prepareTransaction(this.context, provider_id, {
      method: 'get_buckets_by_provider',
      args: [
        { value: provider_id, type: 'address' }
      ]
    });

    if (!response.isSuccess) {
      return [];
    }

    const result = response.result;
    if (Array.isArray(result)) {
      return result as Bucket[];
    }
    return [];
  }

  /**
   * Checks if a bucket is locked
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket to check
   * @returns Promise resolving to true if the bucket is locked, false otherwise
   */
  async isBucketLocked(provider_id: string, bucket_id: number): Promise<boolean> {
    const bucket = await this.getBucket(provider_id, bucket_id);
    if (!bucket) {
      return false;
    }
    return bucket.locked;
  }

  /**
   * Gets bucket pricing information
   * @param provider_id - Address of the provider owning the bucket
   * @param bucket_id - ID of the bucket
   * @returns Promise resolving to pricing information or null if bucket not found
   */
  async getBucketPricing(provider_id: string, bucket_id: number): Promise<{
    price_per_gb_storage: bigint;
    price_per_gb_egress: bigint;
    max_storage_gb: number;
    max_egress_gb: number;
  } | null> {
    const bucket = await this.getBucket(provider_id, bucket_id);
    if (!bucket) {
      return null;
    }

    return {
      price_per_gb_storage: bucket.price_per_gb_storage,
      price_per_gb_egress: bucket.price_per_gb_egress,
      max_storage_gb: bucket.max_storage_gb,
      max_egress_gb: bucket.max_egress_gb
    };
  }
} 