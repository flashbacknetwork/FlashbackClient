import { ClientContext } from './client';
import { ContractStats } from './models';
import { prepareTransaction } from './transaction';

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
