import { get_provider, get_provider_units, register_provider } from './provider';
import { StellarNetwork } from './transaction';

export class FlashOnStellarClient {
  private readonly signTransaction: (xdrToSign: string) => Promise<string>;
  private readonly contractAddress: string;

  constructor(config: {
    contractAddress: string;
    signTransaction: (xdrToSign: string) => Promise<string>;
  }) {
    this.signTransaction = config.signTransaction;
    this.contractAddress = config.contractAddress;
  }

  // Provider methods
  get_provider = (
    wallet_address: string,
    provider_address: string,
    network: StellarNetwork,
    load_units?: boolean
  ) => {
    return get_provider(wallet_address, provider_address, network, load_units);
  };

  get_provider_units = (
    wallet_address: string,
    provider_address: string,
    network: StellarNetwork
  ) => {
    return get_provider_units(wallet_address, provider_address, network);
  };

  register_provider = (
    wallet_address: string,
    provider_address: string,
    provider_description: string,
    network: StellarNetwork
  ) => {
    return register_provider(
      wallet_address,
      provider_address,
      provider_description,
      network,
      this.signTransaction
    );
  };
}

// Re-export types that might be needed by the consumer
export type * from './models';
export { StellarNetwork };
