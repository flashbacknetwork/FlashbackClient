import { sleep } from "../utils/timing";

// Polyfill for BigInt JSON serialization

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

import {
  xdr,
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
  Horizon,
} from "@stellar/stellar-sdk";

import { rpc } from "@stellar/stellar-sdk";
import { ClientContext } from "../client";

// Set global configuration for Stellar SDK to allow HTTP connections
// This is sometimes needed for newer versions of the SDK
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).__STELLAR_SDK_ALLOW_HTTP__ = true;
}

export interface StellarNetwork {
  network: string;
  networkPassphrase: string;
}

const getNetwork = (network: string): StellarNetwork => {
  let networkPassphrase = "";
  switch (network) {
    case "TESTNET":
      networkPassphrase = "Test SDF Network ; September 2015";
      break;
    case "PUBLIC":
      networkPassphrase = "Public Global Stellar Network ; September 2015";
      break;
  }
  return { network, networkPassphrase };
};

const getPublicKeyFromPrivateKey = (privateKey: string): string => {
  const keypair = Keypair.fromSecret(privateKey);
  return keypair.publicKey();
};

const getServer = (network: StellarNetwork): rpc.Server => {
  let serverUrl = "";
  switch (network.network) {
    case "TESTNET":
      serverUrl = "https://soroban-testnet.stellar.org";
      break;
    case "PUBLIC":
      serverUrl = "https://rpc.stellar.org";
      break;
  }
  
  // For Stellar SDK v13+, we need to handle the allowHttp issue
  let server;
  
  // Approach 1: Try with allowHttp option
  try {
    server = new rpc.Server(serverUrl, { allowHttp: true });
    return server;
  } catch (error) {
    console.log(`Failed with allowHttp: true:`, error instanceof Error ? error.message : String(error));
  }
  
  // If all approaches fail, throw a comprehensive error
  throw new Error(`Failed to create Soroban RPC server for ${network.network} at ${serverUrl}. All configuration attempts failed.`);
};

const TIMEOUT_TRANSACTION = 60;
interface ContractMethodCall {
  method: string;
  args?: Array<{
    value:
      | number
      | string
      | bigint
      | boolean
      | null
      | undefined
      | Array<unknown>;
    type:
      | "u32"
      | "i32"
      | "u64"
      | "i64"
      | "u128"
      | "i128"
      | "string"
      | "symbol"
      | "address"
      | "bool"
      | "vec";
  }>;
}

export interface ContractMethodResponse {
  isSuccess: boolean;
  isReadOnly: boolean;
  result: string | unknown;
}

export const getHorizonServer = (network: string) => {
  if (network === "TESTNET") {
    return new Horizon.Server("https://horizon-testnet.stellar.org", { 
      allowHttp: true
    });
  } else {
    return new Horizon.Server("https://horizon.stellar.org", { 
      allowHttp: true
    });
  }
};

export const executeWalletTransaction = async (
  context: ClientContext,
  wallet_address: string,
  method: string,
  additionalArgs: Array<{
    value:
      | string
      | number
      | bigint
      | boolean
      | null
      | Array<unknown>
      | undefined;
    type:
      | "string"
      | "symbol"
      | "address"
      | "u32"
      | "i32"
      | "u64"
      | "i64"
      | "u128"
      | "i128"
      | "bool"
      | "vec";
  }> = [],
): Promise<ContractMethodResponse> => {
  try {
    console.log('executeWalletTransaction: Starting execution', { method, wallet_address, additionalArgs });
    
    console.log('executeWalletTransaction: Calling prepareTransaction...');
    const response = await prepareTransaction(context, wallet_address, {
      method,
      args: [{ value: wallet_address, type: "address" }, ...additionalArgs],
    });
    console.log('executeWalletTransaction: prepareTransaction response:', { isSuccess: response.isSuccess, isReadOnly: response.isReadOnly });

    if (response.isSuccess) {
      if (response.isReadOnly) {
        console.log('executeWalletTransaction: Transaction is read-only, returning response');
        return response;
      }
      
      console.log('executeWalletTransaction: Transaction is not read-only, signing...');
      const signedTxXDR = await context.signTransaction!(
        response.result as string,
      );
      console.log('executeWalletTransaction: Transaction signed successfully');
      
      console.log('executeWalletTransaction: Sending transaction...');
      const sendResponse = await sendTransaction(context, signedTxXDR);
      console.log('executeWalletTransaction: Transaction sent successfully:', sendResponse);
      
      return {
        isSuccess: true,
        isReadOnly: false,
        result: sendResponse,
      };
    }
    
    console.log('executeWalletTransaction: prepareTransaction failed, returning response');
    return response;
  } catch (error) {
    console.error('executeWalletTransaction: Error occurred:', error);
    console.error('executeWalletTransaction: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

export const executeMultiWalletTransactions = async (
  context: ClientContext,
  wallet_address: string,
  methods: Array<{
    method: string;
    additionalArgs?: Array<{
      value: string | number | bigint | boolean | null | undefined;
      type:
        | "string"
        | "symbol"
        | "address"
        | "u32"
        | "i32"
        | "u64"
        | "i64"
        | "u128"
        | "i128"
        | "bool"
        | "vec";
    }>;
  }>,
  extraOperations: xdr.Operation[] = [],
): Promise<ContractMethodResponse> => {
  try {
    console.log('executeMultiWalletTransactions: Starting execution', { wallet_address, methodsCount: methods.length, extraOperationsCount: extraOperations.length });
    
    const contractCalls: ContractMethodCall[] = methods.map(
      ({ method, additionalArgs = [] }) => ({
        method,
        args: [
          { value: wallet_address, type: "address" as const },
          ...additionalArgs,
        ],
      }),
    );
    console.log('executeMultiWalletTransactions: Contract calls prepared:', contractCalls);

    console.log('executeMultiWalletTransactions: Calling prepareTransaction...');
    const response = await prepareTransaction(
      context,
      wallet_address,
      contractCalls,
      extraOperations,
    );
    console.log('executeMultiWalletTransactions: prepareTransaction response:', { isSuccess: response.isSuccess, isReadOnly: response.isReadOnly });

    if (response.isSuccess) {
      if (response.isReadOnly) {
        console.log('executeMultiWalletTransactions: Transaction is read-only, returning response');
        return response;
      }
      
      console.log('executeMultiWalletTransactions: Transaction is not read-only, signing...');
      const signedTxXDR = await context.signTransaction!(
        response.result as string,
      );
      console.log('executeMultiWalletTransactions: Transaction signed successfully');
      
      console.log('executeMultiWalletTransactions: Sending transaction...');
      const sendResponse = await sendTransaction(context, signedTxXDR);
      console.log('executeMultiWalletTransactions: Transaction sent successfully:', sendResponse);
      
      return {
        isSuccess: true,
        isReadOnly: false,
        result: sendResponse,
      };
    }
    
    console.log('executeMultiWalletTransactions: prepareTransaction failed, returning response');
    return response;
  } catch (error) {
    console.error('executeMultiWalletTransactions: Error occurred:', error);
    console.error('executeMultiWalletTransactions: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

const prepareTransaction = async (
  context: ClientContext,
  address: string,
  contractCalls: ContractMethodCall | ContractMethodCall[],
  extraOperations: xdr.Operation[] = [],
): Promise<ContractMethodResponse> => {
  const contractAddress = context.contractAddress;
  const contract = new Contract(contractAddress);
  const server = getServer(context.network);
  const sourceAccount = await server.getAccount(address);
  const response: ContractMethodResponse = {
    isSuccess: false,
    isReadOnly: false,
    result: "",
  };

  // Ensure contractCalls is an array
  const calls = Array.isArray(contractCalls) ? contractCalls : [contractCalls];

  // Convert raw values to ScVal for all calls
  const convertedCalls = calls.map((call) => {
    const converted = {
      method: call.method,
      args:
        call.args?.map((arg) => {
          let scVal;
          if (arg.type === "vec") {
            if (arg.value === null) {
              // Handle null vectors as None
              scVal = nativeToScVal(null, { type: "vec" });
            } else if (Array.isArray(arg.value)) {
              // Handle non-empty vectors
              const vecScVals = (
                arg.value as Array<{ value: unknown; type: string }>
              ).map((item) => nativeToScVal(item.value, { type: item.type }));
              scVal = nativeToScVal({ vec: vecScVals }, { type: "vec" });
            } else {
              // Fallback for invalid vector values
              scVal = nativeToScVal(null, { type: "vec" });
            }
          } else {
            scVal = nativeToScVal(arg.value, { type: arg.type });
          }
          return scVal;
        }) || [],
    };

    return converted;
  });

  const transactionBuilder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: context.network.networkPassphrase,
  });

  // Add all operations to the transaction
  convertedCalls.forEach((call) => {
    transactionBuilder.addOperation(contract.call(call.method, ...call.args));
  });

  extraOperations.forEach((operation) => {
    transactionBuilder.addOperation(operation);
  });

  const builtTransaction = transactionBuilder
    .setTimeout(TIMEOUT_TRANSACTION)
    .build();

  console.log(`About to simulate transaction for method: ${calls[0]?.method || 'unknown'}`);
  
  let sim;
  try {
    sim = await server.simulateTransaction(builtTransaction);
    console.log(`Transaction simulation successful`);
  } catch (error) {
    console.error(`Transaction simulation failed:`, error);
    throw error;
  }

  if (rpc.Api.isSimulationSuccess(sim)) {
    response.isSuccess = true;
    const result =
      sim.result && sim.result.retval
        ? scValToNative(sim.result.retval)
        : undefined;

    const footprint = sim.transactionData.getFootprint();
    const isReadOnly =
      footprint.readOnly().length > 0 && footprint.readWrite().length === 0;
    if (isReadOnly) {
      response.isReadOnly = true;
      response.result = result;
      return response;
    }
    // For write operations, continue with the normal flow of returning the XDR
    const preparedTransaction =
      await server.prepareTransaction(builtTransaction);
    response.result = preparedTransaction.toXDR();
    return response;
  } else {
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(
        `Transaction simulation error: ${JSON.stringify(sim.error)}`,
      );
    }
    throw new Error("Transaction simulation failed");
  }
};

const signTransaction = async (
  context: ClientContext,
  xdrToSign: string,
  privateKey: string,
): Promise<Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction> => {
  const preparedTransaction = TransactionBuilder.fromXDR(
    xdrToSign,
    context.network.networkPassphrase,
  );
  const sourceKeypair = Keypair.fromSecret(privateKey);
  preparedTransaction.sign(sourceKeypair);
  return preparedTransaction;
};

const sendTransaction = async (
  context: ClientContext,
  signedTransactionXDR: string,
  bDebug: boolean = false,
) => {
  try {
    console.log('sendTransaction: Starting transaction submission');
    console.log('sendTransaction: Network:', context.network.networkPassphrase);
    
    const server = getServer(context.network);
    console.log('sendTransaction: Server obtained');

    const signedTransaction = TransactionBuilder.fromXDR(
      signedTransactionXDR,
      context.network.networkPassphrase,
    );
    console.log('sendTransaction: Transaction parsed from XDR');

    // Submit the transaction to the Stellar-RPC server. The RPC server will
    // then submit the transaction into the network for us. Then we will have to
    // wait, polling `getTransaction` until the transaction completes.
    console.log('sendTransaction: Submitting transaction to server...');
    const sendResponse = await server.sendTransaction(signedTransaction);
    console.log('sendTransaction: Server response received:', sendResponse);

    if (sendResponse.status === "PENDING") {
      console.log('sendTransaction: Transaction is pending, hash:', sendResponse.hash);
      console.log('sendTransaction: Starting to poll for transaction completion...');
      
      let getResponse = await server.getTransaction(sendResponse.hash);
      console.log('sendTransaction: Initial getTransaction response:', getResponse);
      
      let pollCount = 0;
      while (getResponse.status === "NOT_FOUND") {
        pollCount++;
        console.log(`sendTransaction: Polling attempt ${pollCount}, transaction not found yet...`);
        // See if the transaction is complete
        getResponse = await server.getTransaction(sendResponse.hash);
        // Wait one second
        await sleep(1000);
      }

      console.log('sendTransaction: Final getTransaction response:', getResponse);

      if (getResponse.status === "SUCCESS") {
        console.log('sendTransaction: Transaction succeeded!');
        console.log('sendTransaction: Full getResponse object:', JSON.stringify(getResponse, null, 2));
        console.log('sendTransaction: getResponse keys:', Object.keys(getResponse));
        console.log('sendTransaction: getResponse.resultMetaXdr exists:', !!getResponse.resultMetaXdr);
        console.log('sendTransaction: getResponse.resultMetaXdr type:', typeof getResponse.resultMetaXdr);
        
        // Make sure the transaction's resultMetaXDR is not empty
        if (!getResponse.resultMetaXdr) {
          console.error('sendTransaction: Empty resultMetaXDR in getTransaction response');
          console.error('sendTransaction: This might indicate a network response format change');
          console.error('sendTransaction: Available fields:', Object.keys(getResponse));
          
          // Try alternative response formats that might have been introduced
          if ('result' in getResponse && getResponse.result) {
            console.log('sendTransaction: Found result field:', getResponse.result);
            return getResponse.result;
          }
          
          if ('returnValue' in getResponse && getResponse.returnValue) {
            console.log('sendTransaction: Found returnValue field:', getResponse.returnValue);
            return getResponse.returnValue;
          }
          
          // If we still can't find the return value, return the full response instead of throwing
          console.log('sendTransaction: No return value found, returning full response');
          return getResponse;
        }
        
        // Find the return value from the contract and return it
        const transactionMeta = getResponse.resultMetaXdr;
        console.log('sendTransaction: transactionMeta type:', typeof transactionMeta);
        console.log('sendTransaction: transactionMeta keys:', Object.keys(transactionMeta));
        
        const returnValue = transactionMeta.v3().sorobanMeta()?.returnValue();
        console.log('sendTransaction: returnValue extracted:', returnValue);
        
        if (returnValue) {
          console.log('sendTransaction: Returning contract return value');
          return scValToNative(returnValue);
        }
        console.log('sendTransaction: Returning full transaction response');
        return getResponse; // Return the full transaction response
      } else {
        console.error('sendTransaction: Transaction failed:', getResponse.resultXdr);
        throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
      }
    } else {
      console.error('sendTransaction: Send response status not PENDING:', sendResponse.status);
      console.error('sendTransaction: Error result:', sendResponse.errorResult);
      throw new Error(sendResponse.errorResult?.toString() || "Unknown error");
    }
  } catch (err) {
    console.error('sendTransaction: Caught error:', err);
    console.error('sendTransaction: Error type:', typeof err);
    console.error('sendTransaction: Error constructor:', err?.constructor?.name);
    
    // Type guard to safely access error properties
    if (err instanceof Error) {
      console.error('sendTransaction: Error message:', err.message);
      console.error('sendTransaction: Error stack:', err.stack);
    } else {
      console.error('sendTransaction: Error is not an Error instance, value:', err);
    }
    
    // If it's already our wrapped error, don't wrap it again
    if (err instanceof Error && err.message.startsWith('Transaction sending error:')) {
      throw err;
    }
    
    // Catch and report any errors we've thrown
    throw new Error(`Transaction sending error: ${JSON.stringify(err)}`);
  }
};

export {
  prepareTransaction,
  sendTransaction,
  signTransaction,
  getNetwork,
  getPublicKeyFromPrivateKey,
  getServer,
};
