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
    console.log(`Attempting to create server with allowHttp: true`);
    server = new rpc.Server(serverUrl, { allowHttp: true });
    console.log(`Soroban RPC server created successfully with allowHttp: true`);
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

interface ContractMethodResponse {
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
  const response = await prepareTransaction(context, wallet_address, {
    method,
    args: [{ value: wallet_address, type: "address" }, ...additionalArgs],
  });

  if (response.isSuccess) {
    if (response.isReadOnly) {
      return response;
    }
    const signedTxXDR = await context.signTransaction!(
      response.result as string,
    );
    const sendResponse = await sendTransaction(context, signedTxXDR);
    return {
      isSuccess: true,
      isReadOnly: false,
      result: sendResponse,
    };
  }
  return response;
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
  const contractCalls: ContractMethodCall[] = methods.map(
    ({ method, additionalArgs = [] }) => ({
      method,
      args: [
        { value: wallet_address, type: "address" as const },
        ...additionalArgs,
      ],
    }),
  );

  const response = await prepareTransaction(
    context,
    wallet_address,
    contractCalls,
    extraOperations,
  );

  if (response.isSuccess) {
    if (response.isReadOnly) {
      return response;
    }
    const signedTxXDR = await context.signTransaction!(
      response.result as string,
    );
    const sendResponse = await sendTransaction(context, signedTxXDR);
    return {
      isSuccess: true,
      isReadOnly: false,
      result: sendResponse,
    };
  }
  return response;
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
  console.log(`Network: ${context.network.network}, Passphrase: ${context.network.networkPassphrase}`);
  
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
  const server = getServer(context.network);

  const signedTransaction = TransactionBuilder.fromXDR(
    signedTransactionXDR,
    context.network.networkPassphrase,
  );

  // Submit the transaction to the Stellar-RPC server. The RPC server will
  // then submit the transaction into the network for us. Then we will have to
  // wait, polling `getTransaction` until the transaction completes.
  try {
    const sendResponse = await server.sendTransaction(signedTransaction);

    if (sendResponse.status === "PENDING") {
      let getResponse = await server.getTransaction(sendResponse.hash);
      while (getResponse.status === "NOT_FOUND") {
        // See if the transaction is complete
        getResponse = await server.getTransaction(sendResponse.hash);
        // Wait one second
        await sleep(1000);
      }

      if (getResponse.status === "SUCCESS") {
        // Make sure the transaction's resultMetaXDR is not empty
        if (!getResponse.resultMetaXdr) {
          throw new Error("Empty resultMetaXDR in getTransaction response");
        }
        // Find the return value from the contract and return it
        const transactionMeta = getResponse.resultMetaXdr;
        const returnValue = transactionMeta.v3().sorobanMeta()?.returnValue();
        if (returnValue) {
          return scValToNative(returnValue);
        }
        return getResponse; // Return the full transaction response
      } else {
        throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
      }
    } else {
      throw new Error(sendResponse.errorResult?.toString() || "Unknown error");
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
  getPublicKeyFromPrivateKey,
  getServer,
};
