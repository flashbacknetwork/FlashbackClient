import { ClientContext } from './client';
import { StorageProvider, StorageUnit } from './models';
import { prepareTransaction, sendTransaction } from './transaction';

const get_provider = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  load_units: boolean = false
): Promise<StorageProvider | null> => {
  const [provider, units] = await Promise.all([
    prepareTransaction(context, wallet_address, {
      method: 'get_provider',
      args: [{ value: provider_address, type: 'address' }],
    }),
    load_units
      ? get_provider_units(context, wallet_address, provider_address)
      : new Map<number, StorageUnit>(),
  ]);

  const typedProviderData = provider.isSuccess ? (provider.result as StorageProvider) : null;
  if (typedProviderData) {
    typedProviderData.units = units;
  }
  return typedProviderData;
};

const get_provider_units = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string
): Promise<Map<number, StorageUnit>> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_provider_units',
    args: [{ value: provider_address, type: 'address' }],
  });

  const typedProviderUnits = response.isSuccess
    ? (response.result as Map<number, StorageUnit>)
    : new Map<number, StorageUnit>();
  return typedProviderUnits;
};

const get_providers = async (
  context: ClientContext,
  wallet_address: string,
  skip: number = 0,
  take: number = 10
): Promise<StorageProvider[]> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_providers',
    args: [
      { value: skip, type: 'u32' },
      { value: take, type: 'u32' },
    ],
  });
  return response.isSuccess ? (response.result as StorageProvider[]) : [];
};

const get_provider_count = async (
  context: ClientContext,
  wallet_address: string
): Promise<number> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_provider_count',
  });
  return response.isSuccess ? (response.result as number) : 0;
};

// Helper function to handle write-mode contract calls
const executeProviderTransaction = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  method: string,
  additionalArgs: Array<{
    value: string | number | bigint | boolean | null | undefined;
    type: 'string' | 'symbol' | 'address' | 'u32' | 'i32' | 'u64' | 'i64' | 'bool';
  }> = []
): Promise<void> => {
  const isOwner = wallet_address !== provider_address;
  const response = await prepareTransaction(context, wallet_address, {
    method,
    args: [
      { value: provider_address, type: 'address' },
      ...additionalArgs,
      { value: isOwner, type: 'bool' },
    ],
  });

  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    await sendTransaction(context, signedTxXDR);
  }
};

const register_provider = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  provider_description: string
): Promise<void> => {
  await executeProviderTransaction(context, wallet_address, provider_address, 'register_provider', [
    { value: provider_description, type: 'string' },
  ]);
};

const delete_provider = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string
): Promise<void> => {
  await executeProviderTransaction(context, wallet_address, provider_address, 'delete_provider');
};

const update_provider = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  provider_description: string
): Promise<void> => {
  await executeProviderTransaction(context, wallet_address, provider_address, 'update_provider', [
    { value: provider_description, type: 'string' },
  ]);
};

export {
  get_provider,
  get_provider_units,
  get_providers,
  get_provider_count,
  register_provider,
  delete_provider,
  update_provider,
};
