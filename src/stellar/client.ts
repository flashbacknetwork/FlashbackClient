import { get_provider, get_provider_units, register_provider } from './provider';
import { get_consumer, get_consumer_reservations, register_consumer } from './consumer';
import { StellarNetwork } from './transaction';
import {
  get_unit,
  get_unit_reservations,
  delete_unit,
  enter_maintenance,
  exit_maintenance,
  enter_decommissioning,
  exit_decommissioning,
} from './unit';
import { requiresSignature } from './decorator';

interface FlashOnStellarClientConfig {
  contractAddress: string;
  signTransaction?: (xdrToSign: string) => Promise<string>;
  network: StellarNetwork;
}
type ClientContext = FlashOnStellarClientConfig;

class FlashOnStellarClient {
  private readonly signTransaction?: (xdrToSign: string) => Promise<string>;
  private readonly contractAddress: string;
  private readonly network: StellarNetwork;

  protected getContext(): ClientContext {
    return {
      network: this.network,
      signTransaction: this.signTransaction,
      contractAddress: this.contractAddress,
    };
  }

  constructor(config: FlashOnStellarClientConfig) {
    this.signTransaction = config.signTransaction;
    this.contractAddress = config.contractAddress;
    this.network = config.network;
  }

  // Provider methods
  get_provider = (wallet_address: string, provider_address: string, load_units?: boolean) => {
    return get_provider(this.getContext(), wallet_address, provider_address, load_units);
  };

  get_provider_units = (wallet_address: string, provider_address: string) => {
    return get_provider_units(this.getContext(), wallet_address, provider_address);
  };

  @requiresSignature
  register_provider = (
    wallet_address: string,
    provider_address: string,
    provider_description: string
  ) => {
    return register_provider(
      this.getContext(),
      wallet_address,
      provider_address,
      provider_description
    );
  };

  // Consumer methods
  get_consumer = (
    wallet_address: string,
    consumer_address: string,
    load_reservations?: boolean
  ) => {
    return get_consumer(this.getContext(), wallet_address, consumer_address, load_reservations);
  };

  get_consumer_reservations = (wallet_address: string, consumer_address: string) => {
    return get_consumer_reservations(this.getContext(), wallet_address, consumer_address);
  };

  @requiresSignature
  register_consumer = (
    wallet_address: string,
    consumer_address: string,
    consumer_description: string
  ) => {
    return register_consumer(
      this.getContext(),
      wallet_address,
      consumer_address,
      consumer_description
    );
  };

  // Unit methods
  get_unit = (wallet_address: string, unit_id: number, load_reservations?: boolean) => {
    return get_unit(this.getContext(), wallet_address, unit_id, load_reservations);
  };

  get_unit_reservations = (wallet_address: string, unit_id: number) => {
    return get_unit_reservations(this.getContext(), wallet_address, unit_id);
  };

  @requiresSignature
  delete_unit = (wallet_address: string, provider_address: string, unit_id: number) => {
    return delete_unit(this.getContext(), wallet_address, provider_address, unit_id);
  };

  @requiresSignature
  enter_maintenance = (
    wallet_address: string,
    provider_address: string,
    unit_id: number,
    maintenance_start: Date,
    maintenance_end: Date
  ) => {
    return enter_maintenance(
      this.getContext(),
      wallet_address,
      provider_address,
      unit_id,
      maintenance_start,
      maintenance_end
    );
  };

  @requiresSignature
  exit_maintenance = (wallet_address: string, provider_address: string, unit_id: number) => {
    return exit_maintenance(this.getContext(), wallet_address, provider_address, unit_id);
  };

  @requiresSignature
  enter_decommissioning = (wallet_address: string, provider_address: string, unit_id: number) => {
    return enter_decommissioning(this.getContext(), wallet_address, provider_address, unit_id);
  };

  @requiresSignature
  exit_decommissioning = (wallet_address: string, provider_address: string, unit_id: number) => {
    return exit_decommissioning(this.getContext(), wallet_address, provider_address, unit_id);
  };

  // Reservation methods
  @requiresSignature
  reserve_unit = (wallet_address: string, consumer_address: string, unit_id: number) => {
    return reserve_unit(this.getContext(), wallet_address, consumer_address, unit_id);
  };
}

export { FlashOnStellarClient, FlashOnStellarClientConfig, ClientContext };
