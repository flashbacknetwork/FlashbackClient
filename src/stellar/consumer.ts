import { ClientContext } from './client';
import { StorageConsumer, StorageReservation } from './models';
import { prepareTransaction, sendTransaction } from './transaction';

const get_consumer = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  load_reservations: boolean = false
): Promise<StorageConsumer | null> => {
  const [consumer, reservations] = await Promise.all([
    prepareTransaction(context, wallet_address, {
      method: 'get_consumer',
      args: [{ value: consumer_address, type: 'address' }],
    }),
    load_reservations
      ? get_consumer_reservations(context, wallet_address, consumer_address)
      : new Map<number, StorageReservation>(),
  ]);

  const typedConsumerData = consumer.isSuccess ? (consumer.result as StorageConsumer) : null;
  if (typedConsumerData) {
    typedConsumerData.reservations = reservations;
  }
  return typedConsumerData;
};

const get_consumer_reservations = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string
): Promise<Map<number, StorageReservation>> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_consumer_reservations',
    args: [{ value: consumer_address, type: 'address' }],
  });

  const typedConsumerReservations = response.isSuccess
    ? (response.result as Map<number, StorageReservation>)
    : new Map<number, StorageReservation>();
  return typedConsumerReservations;
};

const register_consumer = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  consumer_description: string
): Promise<void> => {
  const isOwner = wallet_address !== consumer_address;

  const response = await prepareTransaction(context, wallet_address, {
    method: 'register_consumer',
    args: [
      { value: consumer_address, type: 'address' },
      { value: consumer_description, type: 'string' },
      { value: isOwner, type: 'bool' },
    ],
  });
  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    await sendTransaction(context, signedTxXDR);
  }
};

export { get_consumer, get_consumer_reservations, register_consumer };
