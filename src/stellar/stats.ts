import { ClientContext } from './client.js';
import { ContractStats } from './models.js';
import { prepareTransaction } from './transaction.js';

const get_stats = async (
  context: ClientContext,
  wallet_address: string
): Promise<ContractStats | null> => {
  const stats = await prepareTransaction(context, wallet_address, {
    method: 'get_stats',
    args: [],
  });

  return stats.isSuccess ? (stats.result as ContractStats) : null;
};

export { get_stats };
