import { ClientContext } from "../client/index";
import { prepareTransaction, sendTransaction } from "./transaction";

/* Usage example

Batch read operations:

const client = new UpwealthStellarClient(...);
const wallet_address = "G...";
const contractId = "contract123";

// Batch read both account and asset in a single transaction
const [account, asset] = await client.batch_read(wallet_address, [
  { 
    operation: 'get_account', 
    params: [],
    transform: (result) => new Account(result)
  },
  { 
    operation: 'get_asset', 
    params: [contractId],
    transform: (result) => new Asset(result)
  }
]);

Batch write operations:

// Usage example:
await client.batch_write(wallet_address, [
  { 
    operation: 'register_account', 
    params: [account_name, account_description]
  },
  { 
    operation: 'register_asset', 
    params: [asset_name, asset_description]
  }
]);

*/

// Type for the argument structure used in contract calls
export type ContractArg = {
  value: string | number | bigint | boolean | null | undefined;
  type:
    | "string"
    | "symbol"
    | "address"
    | "u32"
    | "i32"
    | "u64"
    | "i64"
    | "bool";
};

// Type for read operations that can be batched
export type ReadOperation<T> = {
  method: string;
  getArgs: (wallet_address: string, ...extraParams: any[]) => ContractArg[];
  transformResult: (result: any) => T;
};

// Type for the operation with its parameters to be executed
export type BatchedOperation<T> = {
  operation: string;
  params: any[];
  transform: (result: any) => T;
};

// Type for write operations that can be batched
export type BatchedWriteOperation = {
  operation: string;
  params: any[];
};

/**
 * Executes multiple read operations in a single transaction
 * @param context The client context
 * @param wallet_address The wallet address to use for the operations
 * @param operations Array of operations with their parameters to execute
 * @returns Array of results in the same order as the input operations
 */
export async function batchReadOperations<T>(
  context: ClientContext,
  wallet_address: string,
  operations: BatchedOperation<T>[],
): Promise<T[]> {
  const contractCalls = operations.map(({ operation, params }) => ({
    method: operation,
    args: [
      { value: wallet_address, type: "address" as const },
      ...params.map((param) => ({ value: param, type: "string" as const })),
    ],
  }));

  const response = await prepareTransaction(
    context,
    wallet_address,
    contractCalls,
  );

  if (!response.isSuccess || !response.isReadOnly) {
    throw new Error("Batch read operation failed");
  }

  const results = Array.isArray(response.result)
    ? response.result
    : [response.result];

  return operations.map(({ transform }, index) => transform(results[index]));
}

/**
 * Creates a read operation with the given method and transform function
 * @param method The contract method to call
 * @param getArgs Function that generates the arguments for the method
 * @param transformResult Function that transforms the raw result into the expected type
 * @returns A ReadOperation object
 */
export function createReadOperation<T>(
  method: string,
  getArgs: (wallet_address: string, ...extraParams: any[]) => ContractArg[],
  transformResult: (result: any) => T,
): ReadOperation<T> {
  return {
    method,
    getArgs,
    transformResult,
  };
}

export function createOperationFromMethod<T>(
  method: string,
  transformResult: (result: any) => T,
): ReadOperation<T> {
  return createReadOperation<T>(
    method,
    (wallet_address: string, ...extraParams: any[]) => {
      // First arg is always wallet_address
      const args: ContractArg[] = [{ value: wallet_address, type: "address" }];

      // Add any extra params as strings (or we could make this more sophisticated)
      extraParams.forEach((param) => {
        args.push({ value: param, type: "string" });
      });

      return args;
    },
    transformResult,
  );
}

/**
 * Executes multiple write operations in a single transaction
 * @param context The client context
 * @param wallet_address The wallet address to use for the operations
 * @param operations Array of operations with their parameters to execute
 * @returns void
 */
export async function batchWriteOperations(
  context: ClientContext,
  wallet_address: string,
  operations: BatchedWriteOperation[],
): Promise<void> {
  const contractCalls = operations.map(({ operation, params }) => ({
    method: operation,
    args: [
      { value: wallet_address, type: "address" as const },
      ...params.map((param) => ({ value: param, type: "string" as const })),
    ],
  }));

  const response = await prepareTransaction(
    context,
    wallet_address,
    contractCalls,
  );

  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(
      response.result as string,
    );
    await sendTransaction(context, signedTxXDR);
  }
}
