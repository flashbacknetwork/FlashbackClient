// Polyfill for BigInt JSON serialization
// eslint-disable-next-line @typescript-eslint/no-redeclare
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  BASE_FEE,
  scValToNative,
} from '@stellar/stellar-sdk';

import { rpc } from '@stellar/stellar-sdk';
import { Network } from './index';

const getServer = (network: Network): rpc.Server => {
  let serverUrl = '';
  switch (network.network) {
    case 'TESTNET':
      serverUrl = 'https://soroban-testnet.stellar.org:443';
      break;
    case 'PUBLIC':
      serverUrl = 'https://rpc.stellar.org:443';
      break;
  }

  const server = new rpc.Server(serverUrl);
  return server;
};

const TIMEOUT_TRANSACTION = 60;
interface ContractMethodCall {
  method: string;
  args?: Array<{
    value: number | string | bigint | boolean | null | undefined;
    type: 'u32' | 'i32' | 'u64' | 'i64' | 'string' | 'symbol' | 'address' | 'bool';
  }>;
}

interface ContractMethodResponse {
  isSuccess: boolean;
  isReadOnly: boolean;
  result: string | unknown;
}

const prepareTransaction = async (
  address: string,
  network: Network,
  contractCall: ContractMethodCall
): Promise<ContractMethodResponse> => {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '';
  const contract = new Contract(contractAddress);
  const server = getServer(network);
  const sourceAccount = await server.getAccount(address);
  const response: ContractMethodResponse = {
    isSuccess: false,
    isReadOnly: false,
    result: null,
  };

  // Convert raw values to ScVal
  const convertedArgs =
    contractCall.args?.map((arg) => nativeToScVal(arg.value, { type: arg.type })) || [];

  const builtTransaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: network.networkPassphrase,
  })
    .addOperation(contract.call(contractCall.method, ...convertedArgs))
    .setTimeout(TIMEOUT_TRANSACTION)
    .build();

  const sim = await server.simulateTransaction(builtTransaction);
  if (rpc.Api.isSimulationSuccess(sim)) {
    response.isSuccess = true;
    //console.log('Simulation success:', JSON.stringify(sim));
    const result = sim.result && sim.result.retval ? scValToNative(sim.result.retval) : undefined;
    const footprint = sim.transactionData.getFootprint();
    const isReadOnly = footprint.readOnly().length > 0 && footprint.readWrite().length === 0;
    if (isReadOnly) {
      response.isReadOnly = true;
      response.result = result;
      return response;
    }
    // For write operations, continue with the normal flow of returning the XDR
    const preparedTransaction = await server.prepareTransaction(builtTransaction);
    response.result = preparedTransaction.toXDR();
    return response;
  } else {
    if (rpc.Api.isSimulationError(sim)) {
      console.log('Simulation error:', JSON.stringify(sim.error));
    }
    throw new Error('Transaction simulation failed');
  }
};

const sendTransaction = async (signedTransactionXDR: string, network: Network) => {
  const server = getServer(network);

  const signedTransaction = TransactionBuilder.fromXDR(
    signedTransactionXDR,
    network.networkPassphrase
  );

  // Submit the transaction to the Stellar-RPC server. The RPC server will
  // then submit the transaction into the network for us. Then we will have to
  // wait, polling `getTransaction` until the transaction completes.
  try {
    const sendResponse = await server.sendTransaction(signedTransaction);
    console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);

    if (sendResponse.status === 'PENDING') {
      let getResponse = await server.getTransaction(sendResponse.hash);
      // Poll `getTransaction` until the status is not "NOT_FOUND"
      while (getResponse.status === 'NOT_FOUND') {
        console.log('Waiting for transaction confirmation...');
        // See if the transaction is complete
        getResponse = await server.getTransaction(sendResponse.hash);
        // Wait one second
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      //console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);

      if (getResponse.status === 'SUCCESS') {
        // Make sure the transaction's resultMetaXDR is not empty
        if (!getResponse.resultMetaXdr) {
          throw new Error('Empty resultMetaXDR in getTransaction response');
        }
        // Find the return value from the contract and return it
        const transactionMeta = getResponse.resultMetaXdr;
        const returnValue = transactionMeta.v3().sorobanMeta()?.returnValue();
        if (returnValue) {
          console.log(`Transaction result: ${returnValue.value()}`);
        }
      } else {
        throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
      }
    } else {
      throw new Error(sendResponse.errorResult?.toString() || 'Unknown error');
    }
  } catch (err) {
    // Catch and report any errors we've thrown
    console.log('Sending transaction failed');
    console.log(JSON.stringify(err));
  }
};

export { prepareTransaction, sendTransaction };
