import {
  get_provider,
  get_provider_units,
  register_provider,
  delete_provider,
  update_provider,
} from './provider';
import {
  get_consumer,
  get_consumer_reservations,
  register_consumer,
  delete_consumer,
  update_consumer,
} from './consumer';
import {
  get_unit,
  get_unit_reservations,
  delete_unit,
  enter_maintenance,
  exit_maintenance,
  enter_decommissioning,
  exit_decommissioning,
} from './unit';
import {
  create_reservation,
  get_reservation,
  delete_reservation,
  update_inuse_bytes_consumer,
  update_inuse_bytes_provider,
} from './reservation';

import { signTransaction, StellarNetwork, getPublicKeyFromPrivateKey } from './transaction';
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

  // Get public key from private key
  getPublicKey = (privateKey: string): string => {
    return getPublicKeyFromPrivateKey(privateKey);
  };

  // sign with SDK
  signTransactionWithKey = async (xdrToSign: string, privateKey: string): Promise<string> => {
    const signedTx = await signTransaction(this.getContext(), xdrToSign, privateKey);
    return signedTx.toXDR();
  };

  // Provider methods
  get_provider = (wallet_address: string, provider_address: string, load_units?: boolean) => {
    return get_provider(this.getContext(), wallet_address, provider_address, load_units);
  };

  get_provider_units = (wallet_address: string, provider_address: string) => {
    return get_provider_units(this.getContext(), wallet_address, provider_address);
  };

  @requiresSignature
  register_provider(
    wallet_address: string,
    provider_address: string,
    provider_description: string
  ) {
    return register_provider(
      this.getContext(),
      wallet_address,
      provider_address,
      provider_description
    );
  }

  @requiresSignature
  delete_provider(wallet_address: string, provider_address: string) {
    return delete_provider(this.getContext(), wallet_address, provider_address);
  }

  @requiresSignature
  update_provider(wallet_address: string, provider_address: string, provider_description: string) {
    return update_provider(
      this.getContext(),
      wallet_address,
      provider_address,
      provider_description
    );
  }

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
  register_consumer(
    wallet_address: string,
    consumer_address: string,
    consumer_description: string
  ) {
    return register_consumer(
      this.getContext(),
      wallet_address,
      consumer_address,
      consumer_description
    );
  }

  @requiresSignature
  delete_consumer(wallet_address: string, consumer_address: string) {
    return delete_consumer(this.getContext(), wallet_address, consumer_address);
  }

  @requiresSignature
  update_consumer(wallet_address: string, consumer_address: string, consumer_description: string) {
    return update_consumer(
      this.getContext(),
      wallet_address,
      consumer_address,
      consumer_description
    );
  }

  // Unit methods
  get_unit = (wallet_address: string, unit_id: number, load_reservations?: boolean) => {
    return get_unit(this.getContext(), wallet_address, unit_id, load_reservations);
  };

  get_unit_reservations = (wallet_address: string, unit_id: number) => {
    return get_unit_reservations(this.getContext(), wallet_address, unit_id);
  };

  @requiresSignature
  delete_unit(wallet_address: string, provider_address: string, unit_id: number) {
    return delete_unit(this.getContext(), wallet_address, provider_address, unit_id);
  }

  @requiresSignature
  enter_maintenance(
    wallet_address: string,
    provider_address: string,
    unit_id: number,
    maintenance_start: Date,
    maintenance_end: Date
  ) {
    return enter_maintenance(
      this.getContext(),
      wallet_address,
      provider_address,
      unit_id,
      maintenance_start,
      maintenance_end
    );
  }

  @requiresSignature
  exit_maintenance(wallet_address: string, provider_address: string, unit_id: number) {
    return exit_maintenance(this.getContext(), wallet_address, provider_address, unit_id);
  }

  @requiresSignature
  enter_decommissioning(wallet_address: string, provider_address: string, unit_id: number) {
    return enter_decommissioning(this.getContext(), wallet_address, provider_address, unit_id);
  }

  @requiresSignature
  exit_decommissioning(wallet_address: string, provider_address: string, unit_id: number) {
    return exit_decommissioning(this.getContext(), wallet_address, provider_address, unit_id);
  }

  // Reservation methods
  get_reservation = (wallet_address: string, reservation_id: number) => {
    return get_reservation(this.getContext(), wallet_address, reservation_id);
  };

  @requiresSignature
  reserve_unit(
    wallet_address: string,
    consumer_address: string,
    unit_id: number,
    reserved_gb: number
  ) {
    return create_reservation(
      this.getContext(),
      wallet_address,
      consumer_address,
      unit_id,
      reserved_gb
    );
  }

  @requiresSignature
  delete_reservation(wallet_address: string, consumer_address: string, reservation_id: number) {
    return delete_reservation(this.getContext(), wallet_address, consumer_address, reservation_id);
  }

  @requiresSignature
  update_inuse_bytes_consumer(
    wallet_address: string,
    consumer_address: string,
    reservation_id: number,
    inuse_bytes: number
  ) {
    return update_inuse_bytes_consumer(
      this.getContext(),
      wallet_address,
      consumer_address,
      reservation_id,
      inuse_bytes
    );
  }

  @requiresSignature
  update_inuse_bytes_provider(
    wallet_address: string,
    provider_address: string,
    reservation_id: number,
    inuse_bytes: number
  ) {
    return update_inuse_bytes_provider(
      this.getContext(),
      wallet_address,
      provider_address,
      reservation_id,
      inuse_bytes
    );
  }
}

export { FlashOnStellarClient, FlashOnStellarClientConfig, ClientContext };
