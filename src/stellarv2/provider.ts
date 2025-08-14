import { ClientContext } from './client';
import { Provider } from './models';
import { callContractMethod } from './transaction';

/**
 * Provider operations client for FlashOnStellar V2
 * Implements all provider-related contract methods
 */
export class ProviderOps {
  private context: ClientContext;

  constructor(context: ClientContext) {
    this.context = context;
  }

  /**
   * Registers a new provider in the system
   * @param provider_id - Address of the provider to register
   * @param description - Description of the provider
   * @returns Promise resolving to the registration result
   */
  async registerProvider(provider_id: string, description: string): Promise<boolean> {
    return callContractMethod(this.context, provider_id, {
      method: 'register_provider',
      args: [
        { value: provider_id, type: 'address' },
        { value: description, type: 'string' }
      ]
    });
  }

  /**
   * Updates an existing provider's information
   * @param provider_id - Address of the provider to update
   * @param description - New description for the provider
   * @returns Promise resolving to the update result
   */
  async updateProvider(provider_id: string, description: string): Promise<boolean> {
    return callContractMethod(this.context, provider_id, {
      method: 'update_provider',
      args: [
        { value: provider_id, type: 'address' },
        { value: description, type: 'string' }
      ]
    });
  }

  /**
   * Deletes a provider from the system
   * @param provider_id - Address of the provider to delete
   * @returns Promise resolving to the deletion result
   */
  async deleteProvider(provider_id: string): Promise<boolean> {
    return callContractMethod(this.context, provider_id, {
      method: 'delete_provider',
      args: [
        { value: provider_id, type: 'address' }
      ]
    });
  }

  /**
   * Retrieves provider information
   * @param provider_id - Address of the provider to retrieve
   * @returns Promise resolving to Provider object or null if not found
   */
  async getProvider(provider_id: string): Promise<Provider | null> {
    const result = await callContractMethod(this.context, provider_id, {
      method: 'get_provider',
      args: [
        { value: provider_id, type: 'address' }
      ]
    });

    if (result && typeof result === 'object') {
      return result as Provider;
    }
    return null;
  }

  /**
   * Gets the total count of providers in the system
   * @returns Promise resolving to the total number of providers
   */
  async getProviderCount(): Promise<number> {
    const result = await callContractMethod(this.context, '', {
      method: 'get_provider_count',
      args: []
    });

    if (typeof result === 'number') {
      return result;
    }
    return 0;
  }

  /**
   * Retrieves a paginated list of providers
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to a map of provider addresses to Provider objects
   */
  async getProviders(skip: number = 0, take: number = 10): Promise<Map<string, Provider>> {
    const result = await callContractMethod(this.context, '', {
      method: 'get_providers',
      args: [
        { value: skip, type: 'u32' },
        { value: take, type: 'u32' }
      ]
    });

    if (result && typeof result === 'object') {
      // Convert the result to a Map<string, Provider>
      const providerMap = new Map<string, Provider>();
      // Note: The actual conversion depends on how the contract returns the data
      // This is a placeholder implementation
      return providerMap;
    }
    return new Map();
  }

  /**
   * Gets all buckets associated with a provider
   * @param provider_id - Address of the provider
   * @returns Promise resolving to an array of bucket IDs
   */
  async getProviderBuckets(provider_id: string): Promise<string[]> {
    const provider = await this.getProvider(provider_id);
    if (!provider) {
      return [];
    }

    // Extract bucket IDs from the provider's buckets map
    const bucketIds: string[] = [];
    provider.buckets.forEach((_, bucketId) => {
      bucketIds.push(bucketId);
    });

    return bucketIds;
  }

  /**
   * Gets all deals associated with a provider
   * @param provider_id - Address of the provider
   * @returns Promise resolving to an array of deal IDs
   */
  async getProviderDeals(provider_id: string): Promise<string[]> {
    const provider = await this.getProvider(provider_id);
    if (!provider) {
      return [];
    }

    // Extract deal IDs from the provider's deals map
    const dealIds: string[] = [];
    provider.deals.forEach((_, dealId) => {
      dealIds.push(dealId);
    });

    return dealIds;
  }

  /**
   * Gets all active deals associated with a provider
   * @param provider_id - Address of the provider
   * @returns Promise resolving to an array of active deal IDs
   */
  async getProviderActiveDeals(provider_id: string): Promise<string[]> {
    const provider = await this.getProvider(provider_id);
    if (!provider) {
      return [];
    }

    // Extract active deal IDs from the provider's active_deals map
    const activeDealIds: string[] = [];
    provider.active_deals.forEach((_, dealId) => {
      activeDealIds.push(dealId);
    });

    return activeDealIds;
  }

  /**
   * Gets the total number of units (buckets) owned by a provider
   * @param provider_id - Address of the provider
   * @returns Promise resolving to the total number of units
   */
  async getProviderUnitsCount(provider_id: string): Promise<number> {
    const provider = await this.getProvider(provider_id);
    if (!provider) {
      return 0;
    }

    return provider.units_count;
  }
} 