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

const get_consumers = async (
  context: ClientContext,
  wallet_address: string,
  skip: number = 0,
  take: number = 10
): Promise<Map<string, StorageConsumer>> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_consumers',
    args: [
      { value: skip, type: 'u32' },
      { value: take, type: 'u32' },
    ],
  });

  if (!response.isSuccess) {
    return new Map<string, StorageConsumer>();
  }

  // Convert the plain object to a Map
  const consumersObj = response.result as Record<string, StorageConsumer>;
  return new Map(Object.entries(consumersObj));
};

const get_consumer_count = async (
  context: ClientContext,
  wallet_address: string
): Promise<number> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_consumer_count',
  });
  return response.isSuccess ? (response.result as number) : 0;
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

const executeConsumerTransaction = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  method: string,
  additionalArgs: Array<{
    value: string | number | bigint | boolean | null | undefined;
    type: 'string' | 'symbol' | 'address' | 'u32' | 'i32' | 'u64' | 'i64' | 'bool';
  }> = []
): Promise<void> => {
  const isOwner = wallet_address !== consumer_address;
  const response = await prepareTransaction(context, wallet_address, {
    method,
    args: [
      { value: consumer_address, type: 'address' },
      ...additionalArgs,
      { value: isOwner, type: 'bool' },
    ],
  });

  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    await sendTransaction(context, signedTxXDR);
  }
};

const register_consumer = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  consumer_description: string
): Promise<void> => {
  await executeConsumerTransaction(context, wallet_address, consumer_address, 'register_consumer', [
    { value: consumer_description, type: 'string' },
  ]);
};

const delete_consumer = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string
): Promise<void> => {
  await executeConsumerTransaction(context, wallet_address, consumer_address, 'delete_consumer');
};

const update_consumer = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  consumer_description: string
): Promise<void> => {
  await executeConsumerTransaction(context, wallet_address, consumer_address, 'update_consumer', [
    { value: consumer_description, type: 'string' },
  ]);
};

export {
  get_consumer,
  get_consumers,
  get_consumer_count,
  get_consumer_reservations,
  register_consumer,
  delete_consumer,
  update_consumer,
};
