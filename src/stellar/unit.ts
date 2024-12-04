import { ClientContext } from './client';
import { DeletionStatus, StorageReservation, StorageUnit } from './models';
import { prepareTransaction, sendTransaction } from './transaction';

type RegisterUnitResponse = [unitId: number, unit: StorageUnit];
type UnitStatusMethod =
  | 'enter_maintenance'
  | 'exit_maintenance'
  | 'enter_decommissioning'
  | 'exit_decommissioning';

const get_unit = async (
  context: ClientContext,
  wallet_address: string,
  unit_id: number,
  load_reservations: boolean = false
): Promise<StorageUnit | null> => {
  const [unit, reservations] = await Promise.all([
    prepareTransaction(context, wallet_address, {
      method: 'get_unit',
      args: [{ value: unit_id, type: 'u32' }],
    }),
    load_reservations
      ? get_unit_reservations(context, wallet_address, unit_id)
      : new Map<number, StorageReservation>(),
  ]);

  const typedUnitData = unit.isSuccess ? (unit.result as StorageUnit) : null;
  if (typedUnitData) {
    typedUnitData.reservations = reservations;
  }
  return typedUnitData;
};

const get_unit_reservations = async (
  context: ClientContext,
  wallet_address: string,
  unit_id: number
): Promise<Map<number, StorageReservation>> => {
  const response = await prepareTransaction(context, wallet_address, {
    method: 'get_unit_reservations',
    args: [{ value: unit_id, type: 'u32' }],
  });

  const typedUnitReservations = response.isSuccess
    ? (response.result as Map<number, StorageReservation>)
    : new Map<number, StorageReservation>();
  return typedUnitReservations;
};

const register_unit = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  capacity: number,
  endpoint: string
): Promise<RegisterUnitResponse | null> => {
  const isOwner = wallet_address !== provider_address;

  const response = await prepareTransaction(context, wallet_address, {
    method: 'register_unit',
    args: [
      { value: provider_address, type: 'address' },
      { value: capacity, type: 'u32' },
      { value: endpoint, type: 'string' },
      { value: isOwner, type: 'bool' },
    ],
  });
  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    const responseSend = (await sendTransaction(context, signedTxXDR)) as RegisterUnitResponse;
    return responseSend;
  }
  return null;
};

const delete_unit = async (
  context: ClientContext,
  wallet_address: string,
  provider_address: string,
  unit_id: number
): Promise<DeletionStatus | null> => {
  const isOwner = wallet_address !== provider_address;
  const response = await prepareTransaction(context, wallet_address, {
    method: 'delete_unit',
    args: [
      { value: provider_address, type: 'address' },
      { value: unit_id, type: 'u32' },
      { value: isOwner, type: 'bool' },
    ],
  });
  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    const responseSend = (await sendTransaction(context, signedTxXDR)) as DeletionStatus;
    return responseSend;
  }
  return null;
};

const change_unit_status = async (
  context: ClientContext,
  method: UnitStatusMethod,
  wallet_address: string,
  provider_address: string,
  unit_id: number,
  maintenanceStart?: Date,
  maintenanceEnd?: Date
): Promise<boolean | null> => {
  const isOwner = wallet_address !== provider_address;

  const response = await prepareTransaction(context, wallet_address, {
    method: method,
    args: [
      { value: provider_address, type: 'address' },
      { value: unit_id, type: 'u32' },
      ...(method === 'enter_maintenance'
        ? [
            { value: Math.floor(maintenanceStart!.getTime() / 1000), type: 'u64' as const },
            { value: Math.floor(maintenanceEnd!.getTime() / 1000), type: 'u64' as const },
          ]
        : []),
      { value: isOwner, type: 'bool' },
    ],
  });
  if (response.isSuccess && !response.isReadOnly) {
    const signedTxXDR = await context.signTransaction!(response.result as string);
    const responseSend = (await sendTransaction(context, signedTxXDR)) as boolean;
    return responseSend;
  }
  return null;
};

const createUnitMaintenanceChanger = (method: UnitStatusMethod) => {
  return async (
    context: ClientContext,
    wallet_address: string,
    provider_address: string,
    unit_id: number,
    maintenanceStart: Date,
    maintenanceEnd: Date
  ): Promise<boolean | null> => {
    return change_unit_status(
      context,
      method,
      wallet_address,
      provider_address,
      unit_id,
      maintenanceStart,
      maintenanceEnd
    );
  };
};

const createUnitStatusChanger = (method: UnitStatusMethod) => {
  return async (
    context: ClientContext,
    wallet_address: string,
    provider_address: string,
    unit_id: number
  ): Promise<boolean | null> => {
    return change_unit_status(context, method, wallet_address, provider_address, unit_id);
  };
};

const enter_maintenance = createUnitMaintenanceChanger('enter_maintenance');
const exit_maintenance = createUnitStatusChanger('exit_maintenance');
const enter_decommissioning = createUnitStatusChanger('enter_decommissioning');
const exit_decommissioning = createUnitStatusChanger('exit_decommissioning');

export {
  get_unit,
  get_unit_reservations,
  register_unit,
  delete_unit,
  enter_maintenance,
  exit_maintenance,
  enter_decommissioning,
  exit_decommissioning,
};
