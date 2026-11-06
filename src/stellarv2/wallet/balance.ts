import { Horizon } from '@stellar/stellar-sdk';
import { getHorizonServer } from './transaction';

export async function getBalances(
  accountAddress: string,
  network: string
): Promise<Horizon.AccountResponse['balances']> {
  const server = getHorizonServer(network);
  const account = await server.loadAccount(accountAddress);
  return account.balances;
}
