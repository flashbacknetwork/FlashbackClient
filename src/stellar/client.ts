import {
  get_provider,
  get_provider_units,
  get_providers,
  get_provider_count,
  register_provider,
  delete_provider,
  update_provider,
} from './provider';
import {
  get_consumer,
  get_consumer_reservations,
  get_consumers,
  get_consumer_count,
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
  register_unit,
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
import { get_stats } from './stats';

/**
 * Configuration interface for the FlashOnStellar client
 * @interface FlashOnStellarClientConfig
 */
interface FlashOnStellarClientConfig {
  /** Stellar contract address for the FlashOnStellar system */
  contractAddress: string;
  /**
   * Optional callback function to sign non-read Stellar transactions
   * @param xdrToSign - The XDR-encoded transaction to sign
   * @returns Promise resolving to the signed XDR string
   */
  signTransaction?: (xdrToSign: string) => Promise<string>;
  /** Network configuration for Stellar (testnet/public) */
  network: StellarNetwork;
}
type ClientContext = FlashOnStellarClientConfig;

/**
 * Main client class for interacting with the FlashOnStellar system
 * This client provides methods for managing providers, consumers, units, and reservations
 * on the Stellar blockchain.
 */
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

  /**
   * Creates a new instance of the FlashOnStellarClient
   * @param config - Configuration options for the client
   */
  constructor(config: FlashOnStellarClientConfig) {
    this.signTransaction = config.signTransaction;
    this.contractAddress = config.contractAddress;
    this.network = config.network;
  }

  /**
   * Derives a public key from a private key
   * @param privateKey - Stellar private key
   * @returns The corresponding public key
   */
  getPublicKey = (privateKey: string): string => {
    return getPublicKeyFromPrivateKey(privateKey);
  };

  /**
   * Signs a transaction using the provided private key using Stellar SDK
   * The alternative is providing your own signing function (for example, using Wallet Kit).
   * @param xdrToSign - XDR-encoded transaction to sign
   * @param privateKey - Stellar private key to sign with
   * @returns Promise resolving to the signed XDR string
   */
  signTransactionWithKey = async (xdrToSign: string, privateKey: string): Promise<string> => {
    const signedTx = await signTransaction(this.getContext(), xdrToSign, privateKey);
    return signedTx.toXDR();
  };

  // Stats methods
  /**
   * Retrieves stats for the current user
   * @param wallet_address - Address of the wallet requesting the information
   * @returns Promise resolving to DashboardStats object
   */
  get_stats = (wallet_address: string) => {
    return get_stats(this.getContext(), wallet_address);
  };

  // Provider methods
  /**
   * Retrieves provider information
   * @param wallet_address - Address of the wallet requesting the information
   * @param provider_address - Address of the provider to retrieve
   * @param load_units - Optional flag to include provider's units in the response
   * @returns Promise resolving to StorageProvider object
   */
  get_provider = (wallet_address: string, provider_address: string, load_units?: boolean) => {
    return get_provider(this.getContext(), wallet_address, provider_address, load_units);
  };

  /**
   * Retrieves all units associated with a provider
   * @param wallet_address - Address of the wallet requesting the information
   * @param provider_address - Address of the provider
   * @returns Promise resolving to an array of StorageUnit objects
   */
  get_provider_units = (wallet_address: string, provider_address: string) => {
    return get_provider_units(this.getContext(), wallet_address, provider_address);
  };

  /**
   * Retrieves a paginated list of providers
   * @param wallet_address - Address of the wallet requesting the information
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to an array of StorageProvider objects
   */
  get_providers = (wallet_address: string, skip: number = 0, take: number = 10) => {
    return get_providers(this.getContext(), wallet_address, skip, take);
  };

  /**
   * Gets the total count of providers in the system
   * @param wallet_address - Address of the wallet requesting the information
   * @returns Promise resolving to the total number of providers
   */
  get_provider_count = (wallet_address: string) => {
    return get_provider_count(this.getContext(), wallet_address);
  };

  /**
   * Registers a new provider in the system
   * @param wallet_address - Address of the wallet registering the provider
   * @param provider_address - Address for the new provider
   * @param provider_description - Description of the provider
   * @returns Promise resolving to the registration transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if provider address is already registered
   */
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

  /**
   * Deletes a provider from the system
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider to delete
   * @returns Promise resolving to the deletion transaction result
   * @requires Signature - This method requires a transaction signature
   */
  @requiresSignature
  delete_provider(wallet_address: string, provider_address: string) {
    return delete_provider(this.getContext(), wallet_address, provider_address);
  }

  /**
   * Updates provider information
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider to update
   * @param provider_description - New description for the provider
   * @returns Promise resolving to the update transaction result
   * @requires Signature - This method requires a transaction signature
   */
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
  /**
   * Retrieves consumer information
   * @param wallet_address - Address of the wallet requesting the information
   * @param consumer_address - Address of the consumer to retrieve
   * @param load_reservations - Optional flag to include consumer's reservations
   * @returns Promise resolving to StorageConsumer object
   */
  get_consumer = (
    wallet_address: string,
    consumer_address: string,
    load_reservations?: boolean
  ) => {
    return get_consumer(this.getContext(), wallet_address, consumer_address, load_reservations);
  };

  /**
   * Retrieves a paginated list of consumers
   * @param wallet_address - Address of the wallet requesting the information
   * @param skip - Number of items to skip for pagination
   * @param take - Number of items to take per page
   * @returns Promise resolving to an array of StorageConsumer objects
   */
  get_consumers = (wallet_address: string, skip: number = 0, take: number = 10) => {
    return get_consumers(this.getContext(), wallet_address, skip, take);
  };

  /**
   * Gets the total count of consumers in the system
   * @param wallet_address - Address of the wallet requesting the information
   * @returns Promise resolving to the total number of consumers
   */
  get_consumer_count = (wallet_address: string) => {
    return get_consumer_count(this.getContext(), wallet_address);
  };

  /**
   * Retrieves all reservations associated with a consumer
   * @param wallet_address - Address of the wallet requesting the information
   * @param consumer_address - Address of the consumer
   * @returns Promise resolving to an array of StorageReservation objects
   */
  get_consumer_reservations = (wallet_address: string, consumer_address: string) => {
    return get_consumer_reservations(this.getContext(), wallet_address, consumer_address);
  };

  /**
   * Registers a new consumer in the system
   * @param wallet_address - Address of the wallet registering the consumer
   * @param consumer_address - Address for the new consumer
   * @param consumer_description - Description of the consumer
   * @returns Promise resolving to the registration transaction result
   * @requires Signature - This method requires a transaction signature
   */
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
  /**
   * Registers a new storage unit in the system
   * @param wallet_address - Address of the wallet registering the unit
   * @param provider_address - Address of the provider owning the unit
   * @param capacity - Capacity of the storage unit in gigabytes
   * @param endpoint - Endpoint for the storage unit
   * @returns Promise resolving to the registration transaction result
   * @requires Signature - This method requires a transaction signature
   */
  @requiresSignature
  register_unit(
    wallet_address: string,
    provider_address: string,
    capacity: number,
    endpoint: string
  ) {
    return register_unit(this.getContext(), wallet_address, provider_address, capacity, endpoint);
  }

  /**
   * Retrieves storage unit information
   * @param wallet_address - Address of the wallet requesting the information
   * @param unit_id - Identifier of the storage unit
   * @param load_reservations - Optional flag to include unit's reservations
   * @returns Promise resolving to StorageUnit object
   */
  get_unit = (wallet_address: string, unit_id: number, load_reservations?: boolean) => {
    return get_unit(this.getContext(), wallet_address, unit_id, load_reservations);
  };

  /**
   * Retrieves all reservations for a specific storage unit
   * @param wallet_address - Address of the wallet requesting the information
   * @param unit_id - Identifier of the storage unit
   * @returns Promise resolving to an array of StorageReservation objects
   */
  get_unit_reservations = (wallet_address: string, unit_id: number) => {
    return get_unit_reservations(this.getContext(), wallet_address, unit_id);
  };

  /**
   * Deletes a storage unit from the system
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider owning the unit
   * @param unit_id - Identifier of the storage unit
   * @returns Promise resolving to the deletion transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if unit has active reservations
   */
  @requiresSignature
  delete_unit(wallet_address: string, provider_address: string, unit_id: number) {
    return delete_unit(this.getContext(), wallet_address, provider_address, unit_id);
  }

  /**
   * Places a storage unit into maintenance mode
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider owning the unit
   * @param unit_id - Identifier of the storage unit
   * @param maintenance_start - Start date of maintenance period
   * @param maintenance_end - End date of maintenance period
   * @returns Promise resolving to the maintenance transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if unit has active reservations that conflict with the maintenance window
   */
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

  /**
   * Exits maintenance mode for a storage unit
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider owning the unit
   * @param unit_id - Identifier of the storage unit
   * @returns Promise resolving to the maintenance exit transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if unit is not in maintenance mode
   */
  @requiresSignature
  exit_maintenance(wallet_address: string, provider_address: string, unit_id: number) {
    return exit_maintenance(this.getContext(), wallet_address, provider_address, unit_id);
  }

  /**
   * Places a storage unit into decommissioning mode
   * This starts the process of removing the unit from service.
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider owning the unit
   * @param unit_id - Identifier of the storage unit
   * @returns Promise resolving to the decommissioning transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if unit has active reservations
   */
  @requiresSignature
  enter_decommissioning(wallet_address: string, provider_address: string, unit_id: number) {
    return enter_decommissioning(this.getContext(), wallet_address, provider_address, unit_id);
  }

  /**
   * Exits decommissioning mode for a storage unit
   * This cancels the decommissioning process and returns the unit to service.
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider owning the unit
   * @param unit_id - Identifier of the storage unit
   * @returns Promise resolving to the decommissioning exit transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if unit is not in decommissioning mode
   */
  @requiresSignature
  exit_decommissioning(wallet_address: string, provider_address: string, unit_id: number) {
    return exit_decommissioning(this.getContext(), wallet_address, provider_address, unit_id);
  }

  // Reservation methods
  /**
   * Retrieves information about a specific reservation
   * @param wallet_address - Address of the wallet requesting the information
   * @param reservation_id - Identifier of the reservation
   * @returns Promise resolving to StorageReservation object
   */
  get_reservation = (wallet_address: string, reservation_id: number) => {
    return get_reservation(this.getContext(), wallet_address, reservation_id);
  };

  /**
   * Creates a new storage reservation
   * @param wallet_address - Address of the wallet making the request
   * @param consumer_address - Address of the consumer requesting storage
   * @param unit_id - Identifier of the storage unit to reserve
   * @param reserved_gb - Amount of storage to reserve in gigabytes
   * @returns Promise resolving to the reservation creation transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if unit doesn't have enough available capacity
   * @throws Will throw if unit is in maintenance or decommissioning mode
   */
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

  /**
   * Deletes an existing reservation
   * @param wallet_address - Address of the wallet making the request
   * @param consumer_address - Address of the consumer who owns the reservation
   * @param reservation_id - Identifier of the reservation to delete
   * @returns Promise resolving to the reservation deletion transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if reservation has non-zero inuse_bytes
   */
  @requiresSignature
  delete_reservation(wallet_address: string, consumer_address: string, reservation_id: number) {
    return delete_reservation(this.getContext(), wallet_address, consumer_address, reservation_id);
  }

  /**
   * Updates the amount of storage currently in use by a consumer
   * @param wallet_address - Address of the wallet making the request
   * @param consumer_address - Address of the consumer
   * @param reservation_id - Identifier of the reservation
   * @param inuse_bytes - Current number of bytes in use
   * @returns Promise resolving to the update transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if inuse_bytes exceeds reserved amount
   */
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

  /**
   * Updates the amount of storage currently in use, reported by provider
   * @param wallet_address - Address of the wallet making the request
   * @param provider_address - Address of the provider
   * @param reservation_id - Identifier of the reservation
   * @param inuse_bytes - Current number of bytes in use
   * @returns Promise resolving to the update transaction result
   * @requires Signature - This method requires a transaction signature
   * @throws Will throw if inuse_bytes exceeds reserved amount
   * @throws Will throw if provider's report differs significantly from consumer's report
   */
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
