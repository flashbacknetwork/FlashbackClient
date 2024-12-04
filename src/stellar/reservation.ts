import { ClientContext } from './client';
import { StorageReservation } from './models';
import { prepareTransaction, sendTransaction } from './transaction';

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

const create_reservation = async (
  context: ClientContext,
  wallet_address: string,
  consumer_address: string,
  unit_id: number,
  reserved_gb: number
): Promise<boolean> => {
  const isOwner = wallet_address !== consumer_address;

  const response = await prepareTransaction(context, wallet_address, {
    method: 'create_reservation',
    args: [
      { value: consumer_address, type: 'address' },
      { value: unit_id, type: 'u32' },
      { value: reserved_gb, type: 'u64' },
      { value: isOwner, type: 'bool' },
    ],
  });

  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    const responseSend = (await sendTransaction(context, signedTxXDR)) as boolean;
    return responseSend;
  }
  return false;
};

export { get_reservation, create_reservation };
