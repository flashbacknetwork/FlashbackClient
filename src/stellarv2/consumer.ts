import { ClientContext } from './client';
import { Consumer } from './models';
import { callContractMethod } from './transaction';

/**
 * Consumer operations client for FlashOnStellar V2
 * Implements all consumer-related contract methods
 */
export class ConsumerOps {
  private context: ClientContext;

  constructor(context: ClientContext) {
    this.context = context;
  }

  /**
   * Registers a new consumer in the system
   * @param consumer_id - Address of the consumer to register
   * @param description - Description of the consumer
   * @returns Promise resolving to the registration result
   */
  async registerConsumer(consumer_id: string, description: string): Promise<boolean> {
    return callContractMethod(this.context, consumer_id, {
      method: 'register_consumer',
      args: [
        { value: consumer_id, type: 'address' },
        { value: description, type: 'string' }
      ]
    });
  }

  /**
   * Updates an existing consumer's information
   * @param consumer_id - Address of the consumer to update
   * @param description - New description for the consumer
   * @returns Promise resolving to the update result
   */
  async updateConsumer(consumer_id: string, description: string): Promise<boolean> {
    return callContractMethod(this.context, consumer_id, {
      method: 'update_consumer',
      args: [
        { value: consumer_id, type: 'address' },
        { value: description, type: 'string' }
      ]
    });
  }

  /**
   * Deletes a consumer from the system
   * @param consumer_id - Address of the consumer to delete
   * @returns Promise resolving to the deletion result
   */
  async deleteConsumer(consumer_id: string): Promise<boolean> {
    return callContractMethod(this.context, consumer_id, {
      method: 'delete_consumer',
      args: [
        { value: consumer_id, type: 'address' }
      ]
    });
  }

  /**
   * Retrieves consumer information
   * @param consumer_id - Address of the consumer to retrieve
   * @returns Promise resolving to Consumer object or null if not found
   */
  async getConsumer(consumer_id: string): Promise<Consumer | null> {
    const result = await callContractMethod(this.context, consumer_id, {
      method: 'get_consumer',
      args: [
        { value: consumer_id, type: 'address' }
      ]
    });

    if (result && typeof result === 'object') {
      return result as Consumer;
    }
    return null;
  }

  /**
   * Gets the total count of consumers in the system
   * @returns Promise resolving to the total number of consumers
   */
  async getConsumerCount(): Promise<number> {
    const result = await callContractMethod(this.context, '', {
      method: 'get_consumer_count',
      args: []
    });

    if (typeof result === 'number') {
      return result;
    }
    return 0;
  }

  /**
   * Retrieves a paginated list of consumers
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to a map of consumer addresses to Consumer objects
   */
  async getConsumers(skip: number = 0, take: number = 10): Promise<Map<string, Consumer>> {
    const result = await callContractMethod(this.context, '', {
      method: 'get_consumers',
      args: [
        { value: skip, type: 'u32' },
        { value: take, type: 'u32' }
      ]
    });

    if (result && typeof result === 'object') {
      // Convert the result to a Map<string, Consumer>
      const consumerMap = new Map<string, Consumer>();
      // Note: The actual conversion depends on how the contract returns the data
      // This is a placeholder implementation
      return consumerMap;
    }
    return new Map();
  }

  /**
   * Gets all deals associated with a consumer
   * @param consumer_id - Address of the consumer
   * @returns Promise resolving to an array of deal IDs
   */
  async getConsumerDeals(consumer_id: string): Promise<string[]> {
    const consumer = await this.getConsumer(consumer_id);
    if (!consumer) {
      return [];
    }

    // Extract deal IDs from the consumer's deals map
    const dealIds: string[] = [];
    consumer.deals.forEach((_, dealId) => {
      dealIds.push(dealId);
    });

    return dealIds;
  }

  /**
   * Gets all active deals associated with a consumer
   * @param consumer_id - Address of the consumer
   * @returns Promise resolving to an array of active deal IDs
   */
  async getConsumerActiveDeals(consumer_id: string): Promise<string[]> {
    const consumer = await this.getConsumer(consumer_id);
    if (!consumer) {
      return [];
    }

    // Extract active deal IDs from the consumer's active_deals map
    const activeDealIds: string[] = [];
    consumer.active_deals.forEach((_, dealId) => {
      activeDealIds.push(dealId);
    });

    return activeDealIds;
  }
} 