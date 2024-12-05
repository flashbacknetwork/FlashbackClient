import { setTimeout } from 'timers/promises';

// Polyfill for BigInt JSON serialization

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  BASE_FEE,
  scValToNative,
  Transaction,
  Memo,
  MemoType,
  Operation,
  Keypair,
  FeeBumpTransaction,
} from '@stellar/stellar-sdk';

import { rpc } from '@stellar/stellar-sdk';
import { ClientContext } from './client';

interface StellarNetwork {
  network: string;
  networkPassphrase: string;
}

const getNetwork = (network: string): StellarNetwork => {
  let networkPassphrase = '';
  switch (network) {
    case 'TESTNET':
      networkPassphrase = 'Test SDF Network ; September 2015';
      break;
    case 'PUBLIC':
      networkPassphrase = 'Public Global Stellar Network ; September 2015';
      break;
  }
  return { network, networkPassphrase };
};

const getPublicKeyFromPrivateKey = (privateKey: string): string => {
  const keypair = Keypair.fromSecret(privateKey);
  return keypair.publicKey();
};

const getServer = (network: StellarNetwork): rpc.Server => {
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
  context: ClientContext,
  address: string,
  contractCall: ContractMethodCall
): Promise<ContractMethodResponse> => {
  const contractAddress = context.contractAddress;
  const contract = new Contract(contractAddress);
  const server = getServer(context.network);
  const sourceAccount = await server.getAccount(address);
  const response: ContractMethodResponse = {
    isSuccess: false,
    isReadOnly: false,
    result: '',
  };

  // Convert raw values to ScVal
  const convertedArgs =
    contractCall.args?.map((arg) => nativeToScVal(arg.value, { type: arg.type })) || [];

  const builtTransaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: context.network.networkPassphrase,
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
      throw new Error(`Tansaction simulation error: ${JSON.stringify(sim.error)}`);
    }
    throw new Error('Transaction simulation failed');
  }
};

const signTransaction = async (
  context: ClientContext,
  xdrToSign: string,
  privateKey: string
): Promise<Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction> => {
  const preparedTransaction = TransactionBuilder.fromXDR(
    xdrToSign,
    context.network.networkPassphrase
  );
  const sourceKeypair = Keypair.fromSecret(privateKey);
  preparedTransaction.sign(sourceKeypair);
  return preparedTransaction;
};

const sendTransaction = async (context: ClientContext, signedTransactionXDR: string) => {
  const server = getServer(context.network);

  const signedTransaction = TransactionBuilder.fromXDR(
    signedTransactionXDR,
    context.network.networkPassphrase
  );

  // Submit the transaction to the Stellar-RPC server. The RPC server will
  // then submit the transaction into the network for us. Then we will have to
  // wait, polling `getTransaction` until the transaction completes.
  try {
    const sendResponse = await server.sendTransaction(signedTransaction);

    if (sendResponse.status === 'PENDING') {
      let getResponse = await server.getTransaction(sendResponse.hash);
      // Poll `getTransaction` until the status is not "NOT_FOUND"
      while (getResponse.status === 'NOT_FOUND') {
        // See if the transaction is complete
        getResponse = await server.getTransaction(sendResponse.hash);
        // Wait one second
        await setTimeout(1000);
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
          return scValToNative(returnValue);
        }
      } else {
        throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
      }
    } else {
      throw new Error(sendResponse.errorResult?.toString() || 'Unknown error');
    }
  } catch (err) {
    // Catch and report any errors we've thrown
    throw new Error(`Transaction sending error: ${JSON.stringify(err)}`);
  }
};

export {
  prepareTransaction,
  sendTransaction,
  signTransaction,
  getNetwork,
  StellarNetwork,
  getPublicKeyFromPrivateKey,
};
