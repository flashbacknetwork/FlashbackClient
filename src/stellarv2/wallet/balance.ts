import { AccountResponse } from "@stellar/stellar-sdk/lib/horizon";
import { getHorizonServer } from "./transaction";

export async function getBalances(
  accountAddress: string,
  network: string,
): Promise<AccountResponse["balances"]> {
  const server = getHorizonServer(network);
  const account = await server.loadAccount(accountAddress);
  return account.balances;
}
