import { StorageConsumer, StorageReservation } from './models';
import { prepareTransaction, StellarNetwork } from './transaction';

const get_consumer = async (
  wallet_address: string,
  consumer_address: string,
  network: StellarNetwork,
  load_reservations: boolean = false
): Promise<StorageConsumer | null> => {
  const [consumer, reservations] = await Promise.all([
    prepareTransaction(wallet_address, network, {
      method: 'get_consumer',
      args: [{ value: consumer_address, type: 'address' }],
    }),
    load_reservations
      ? get_consumer_reservations(wallet_address, consumer_address, network)
      : new Map<number, StorageReservation>(),
  ]);

  const typedConsumerData = consumer.isSuccess ? (consumer.result as StorageConsumer) : null;
  if (typedConsumerData) {
    typedConsumerData.reservations = reservations;
  }
  return typedConsumerData;
};

const get_consumer_reservations = async (
  wallet_address: string,
  consumer_address: string,
  network: StellarNetwork
): Promise<Map<number, StorageReservation>> => {
  const response = await prepareTransaction(wallet_address, network, {
    method: 'get_consumer_reservations',
    args: [{ value: consumer_address, type: 'address' }],
  });

  const typedConsumerReservations = response.isSuccess
    ? (response.result as Map<number, StorageReservation>)
    : new Map<number, StorageReservation>();
  return typedConsumerReservations;
};

export { get_consumer, get_consumer_reservations };
