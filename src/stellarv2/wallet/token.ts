import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { getServer, StellarNetwork } from "./transaction";

const changeTrustXDR = async (
  network: StellarNetwork,
  source: string,
  issuerPublikKey: string,
  asset_ticker: string,
  bRemove: boolean,
): Promise<string> => {
  const server = getServer(network);
  const account = await server.getAccount(source);
  const asset = new Asset(asset_ticker, issuerPublikKey);

  const changeParams = bRemove ? { limit: "0" } : {};
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: network.networkPassphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
        ...changeParams,
      }),
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
};

export { changeTrustXDR };
