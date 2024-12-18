import { ClientContext } from './client.js';
import { DeletionStatus, StorageReservation } from './models.js';
import { prepareTransaction, sendTransaction } from './transaction.js';

const get_reservation = async (
  context: ClientContext,
  wallet_address: string,
  reservation_id: number
): Promise<StorageReservation | null> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_reservation',
    args: [{ value: reservation_id, type: 'u32' }],
  });

  return response.isSuccess ? (response.result as StorageReservation) : null;
};

const executeReservationTransaction = async <T>(
  context: ClientContext,
  wallet_address: string,
  method: string,
  additionalArgs: Array<{
    value: string | number | bigint | boolean | null | undefined;
    type: 'string' | 'symbol' | 'address' | 'u32' | 'i32' | 'u64' | 'i64' | 'bool';
  }> = [],
  defaultValue?: T
): Promise<T> => {
  const response = await prepareTransaction(context, wallet_address, {
    method,
    args: additionalArgs,
  });

  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    return sendTransaction(context, signedTxXDR) as T;
  }
  return defaultValue!;
};

const create_reservation = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  unit_id: number,
  reserved_gb: number
): Promise<boolean> => {
  const is_owner = wallet_address !== consumer_address;
  return executeReservationTransaction<boolean>(context, wallet_address, 'create_reservation', [
    { value: consumer_address, type: 'address' },
    { value: unit_id, type: 'u32' },
    { value: reserved_gb, type: 'u32' },
    { value: is_owner, type: 'bool' },
  ]);
};

const delete_reservation = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  reservation_id: number
): Promise<DeletionStatus> => {
  const is_owner = wallet_address !== consumer_address;
  return (
    executeReservationTransaction<DeletionStatus>(context, wallet_address, 'delete_reservation', [
      { value: reservation_id, type: 'u32' },
      { value: is_owner, type: 'bool' },
    ]) || 'NotFound'
  );
};

const update_inuse_bytes_consumer = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  reservation_id: number,
  inuse_bytes: number
): Promise<boolean> => {
  const is_owner = wallet_address !== consumer_address;
  return executeReservationTransaction<boolean>(
    context,
    wallet_address,
    'update_inuse_bytes_consumer',
    [
      { value: reservation_id, type: 'u32' },
      { value: consumer_address, type: 'address' },
      { value: inuse_bytes, type: 'u64' },
      { value: is_owner, type: 'bool' },
    ]
  );
};

const update_inuse_bytes_provider = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  reservation_id: number,
  inuse_bytes: number
): Promise<boolean> => {
  const is_owner = wallet_address !== provider_address;
  return executeReservationTransaction<boolean>(
    context,
    wallet_address,
    'update_inuse_bytes_consumer',
    [
      { value: reservation_id, type: 'u32' },
      { value: provider_address, type: 'address' },
      { value: inuse_bytes, type: 'u64' },
      { value: is_owner, type: 'bool' },
    ]
  );
};

export {
  get_reservation,
  create_reservation,
  delete_reservation,
  update_inuse_bytes_consumer,
  update_inuse_bytes_provider,
};
