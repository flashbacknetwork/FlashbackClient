import { StorageProvider, StorageUnit } from './models';
import { prepareTransaction, sendTransaction, StellarNetwork } from './transaction';

const get_provider = async (
  wallet_address: string,
  provider_address: string,
  network: StellarNetwork,
  load_units: boolean = false
): Promise<StorageProvider | null> => {
  const [provider, units] = await Promise.all([
    prepareTransaction(wallet_address, network, {
      method: 'get_provider',
      args: [{ value: provider_address, type: 'address' }],
    }),
    load_units
      ? get_provider_units(wallet_address, provider_address, network)
      : new Map<number, StorageUnit>(),
  ]);

  const typedProviderData = provider.isSuccess ? (provider.result as StorageProvider) : null;
  if (typedProviderData) {
    typedProviderData.units = units;
  }
  return typedProviderData;
};

const get_provider_units = async (
  wallet_address: string,
  provider_address: string,
  network: StellarNetwork
): Promise<Map<number, StorageUnit>> => {
  const response = await prepareTransaction(wallet_address, network, {
    method: 'get_provider_units',
    args: [{ value: provider_address, type: 'address' }],
  });

  const typedProviderUnits = response.isSuccess
    ? (response.result as Map<number, StorageUnit>)
    : new Map<number, StorageUnit>();
  return typedProviderUnits;
};

const register_provider = async (
  wallet_address: string,
  provider_address: string,
  provider_description: string,
  network: StellarNetwork,
  signTransaction: (xdrToSign: string) => Promise<string>
): Promise<void> => {
  const response = await prepareTransaction(wallet_address, network, {
    method: 'register_provider',
    args: [
      { value: provider_address, type: 'address' },
      { value: provider_description, type: 'string' },
      { value: false, type: 'bool' },
    ],
  });
  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await signTransaction(response.result as string);
    await sendTransaction(signedTxXDR, network);
  }
};

export { get_provider, get_provider_units, register_provider };
