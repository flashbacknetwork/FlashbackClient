interface StorageConsumer {
  description: string;
  reputation: number;
  registered_ts: number;
  last_update_ts: number;
  reservations: Map<number, StorageReservation>;
  reservations_count: number;
}

type StorageReservationStatus = 'Reserved' | 'In Use' | 'Maintenance' | 'Decommissioning';

interface StorageReservation {
  unit_id: number;
  consumer_id: string;
  status: StorageReservationStatus | StorageReservationStatus[];
  reserved_gb: number;
  inuse_bytes_consumer: bigint;
  inuse_bytes_consumer_ts: bigint;
  inuse_bytes_provider: bigint;
  inuse_bytes_provider_ts: bigint;
  creation_ts: number;
}

type StorageUnitStatus = 'Available' | 'Reserved' | 'In Use' | 'Maintenance' | 'Decommissioning';
type DeletionStatus =
  | 'ReservationInUse'
  | 'UnitInUse'
  | 'UnitNotDecommissioned'
  | 'Unauthorized'
  | 'NotFound'
  | 'Success';

// TypeScript interfaces
interface StorageUnit {
  provider_id: string;
  address: string;
  status: StorageUnitStatus | StorageUnitStatus[];
  last_update_ts: number;
  maintenance_start_ts: number;
  maintenance_end_ts: number;
  previous_status: StorageUnitStatus | StorageUnitStatus[];
  capacity_gb: number;
  reserved_gb: number;
  inuse_bytes_provider: number;
  inuse_bytes_provider_ts: number;
  reservations_count: number;
  reservations: Map<number, StorageReservation>;
}

interface StorageProvider {
  units: Map<number, StorageUnit>;
  description: string;
  reputation: number; // 0 to 100
  registered_ts: number;
  last_update_ts: number;
  units_count: number;
}

interface ContractStats {
  unit_count: number;
  total_capacity_gb: number;
  total_reserved_gb: number;
  total_inuse_bytes_consumer: number;
  total_inuse_bytes_provider: number;
  total_maintenance_gb: number;
  total_decommissioning_gb: number;
}

export type {
  StorageConsumer,
  StorageReservation,
  StorageUnit,
  StorageProvider,
  ContractStats,
  StorageUnitStatus,
  StorageReservationStatus,
  DeletionStatus,
};
