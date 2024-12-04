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

const register_provider = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  provider_description: string
): Promise<void> => {
  const isOwner = wallet_address !== provider_address;

  const response = await prepareTransaction(context, wallet_address, {
    method: 'register_provider',
    args: [
      { value: provider_address, type: 'address' },
      { value: provider_description, type: 'string' },
      { value: isOwner, type: 'bool' },
    ],
  });
  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    await sendTransaction(context, signedTxXDR);
  }
};

export { get_provider, get_provider_units, register_provider };
