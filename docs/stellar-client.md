# Stellar Client Documentation

## Overview

The `FlashOnStellarClient` provides direct interaction with Stellar blockchain smart contracts for decentralized storage operations. This client enables applications to manage providers, consumers, storage units, and reservations directly on the Stellar network.

## Installation & Setup

```typescript
import { FlashOnStellarClient, StellarNetwork } from 'flashback-client/stellar';

const client = new FlashOnStellarClient({
  contractAddress: 'your-contract-address',
  network: StellarNetwork.TESTNET, // or StellarNetwork.PUBLIC
  signTransaction: async (xdrToSign: string) => {
    // Your custom signing function
    return signedXdr;
  }
});
```

## Configuration

### FlashOnStellarClientConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `contractAddress` | `string` | Yes | Stellar contract address for the FlashOnStellar system |
| `network` | `StellarNetwork` | Yes | Network configuration (TESTNET/PUBLIC) |
| `signTransaction` | `(xdrToSign: string) => Promise<string>` | No | Custom transaction signing function |

## Utility Methods

### getPublicKey

Derives a public key from a private key.

```typescript
getPublicKey(privateKey: string): string
```

**Parameters:**
- `privateKey` (string): Stellar private key

**Returns:** The corresponding public key

**Example:**
```typescript
const publicKey = client.getPublicKey('SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
console.log(publicKey); // GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### signTransactionWithKey

Signs a transaction using a provided private key.

```typescript
signTransactionWithKey(xdrToSign: string, privateKey: string): Promise<string>
```

**Parameters:**
- `xdrToSign` (string): XDR-encoded transaction to sign
- `privateKey` (string): Stellar private key to sign with

**Returns:** Promise resolving to the signed XDR string

**Example:**
```typescript
const signedXdr = await client.signTransactionWithKey(xdrTransaction, privateKey);
```

## Statistics Methods

### get_stats

Retrieves dashboard statistics for a wallet address.

```typescript
get_stats(wallet_address: string): Promise<DashboardStats>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information

**Returns:** Promise resolving to DashboardStats object

**Example:**
```typescript
const stats = await client.get_stats('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
console.log(stats);
```

## Provider Methods

### get_provider

Retrieves information about a specific provider.

```typescript
get_provider(wallet_address: string, provider_address: string, load_units?: boolean): Promise<StorageProvider>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `provider_address` (string): Address of the provider to retrieve
- `load_units` (boolean, optional): Flag to include provider's units in the response

**Returns:** Promise resolving to StorageProvider object

**Example:**
```typescript
const provider = await client.get_provider(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
  true
);
```

### get_provider_units

Retrieves all units associated with a provider.

```typescript
get_provider_units(wallet_address: string, provider_address: string): Promise<StorageUnit[]>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `provider_address` (string): Address of the provider

**Returns:** Promise resolving to an array of StorageUnit objects

**Example:**
```typescript
const units = await client.get_provider_units(walletAddress, providerAddress);
units.forEach(unit => console.log(`Unit ${unit.id}: ${unit.capacity}GB`));
```

### get_providers

Retrieves a paginated list of providers.

```typescript
get_providers(wallet_address: string, skip?: number, take?: number): Promise<StorageProvider[]>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `skip` (number, optional): Number of items to skip for pagination (default: 0)
- `take` (number, optional): Number of items to take per page (default: 10)

**Returns:** Promise resolving to an array of StorageProvider objects

**Example:**
```typescript
const providers = await client.get_providers(walletAddress, 0, 20);
```

### get_provider_count

Gets the total count of providers in the system.

```typescript
get_provider_count(wallet_address: string): Promise<number>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information

**Returns:** Promise resolving to the total number of providers

**Example:**
```typescript
const count = await client.get_provider_count(walletAddress);
console.log(`Total providers: ${count}`);
```

### register_provider

Registers a new provider in the system. **Requires signature.**

```typescript
register_provider(wallet_address: string, provider_address: string, provider_description: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet registering the provider
- `provider_address` (string): Address for the new provider
- `provider_description` (string): Description of the provider

**Returns:** Promise resolving to the registration transaction result

**Throws:** Will throw if provider address is already registered

**Example:**
```typescript
const result = await client.register_provider(
  walletAddress,
  newProviderAddress,
  'High-performance storage provider'
);
```

### update_provider

Updates provider information. **Requires signature.**

```typescript
update_provider(wallet_address: string, provider_address: string, provider_description: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider to update
- `provider_description` (string): New description for the provider

**Returns:** Promise resolving to the update transaction result

**Example:**
```typescript
const result = await client.update_provider(
  walletAddress,
  providerAddress,
  'Updated provider description'
);
```

### delete_provider

Deletes a provider from the system. **Requires signature.**

```typescript
delete_provider(wallet_address: string, provider_address: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider to delete

**Returns:** Promise resolving to the deletion transaction result

**Example:**
```typescript
const result = await client.delete_provider(walletAddress, providerAddress);
```

## Consumer Methods

### get_consumer

Retrieves information about a specific consumer.

```typescript
get_consumer(wallet_address: string, consumer_address: string, load_reservations?: boolean): Promise<StorageConsumer>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `consumer_address` (string): Address of the consumer to retrieve
- `load_reservations` (boolean, optional): Flag to include consumer's reservations

**Returns:** Promise resolving to StorageConsumer object

**Example:**
```typescript
const consumer = await client.get_consumer(walletAddress, consumerAddress, true);
```

### get_consumers

Retrieves a paginated list of consumers.

```typescript
get_consumers(wallet_address: string, skip?: number, take?: number): Promise<StorageConsumer[]>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `skip` (number, optional): Number of items to skip for pagination (default: 0)
- `take` (number, optional): Number of items to take per page (default: 10)

**Returns:** Promise resolving to an array of StorageConsumer objects

**Example:**
```typescript
const consumers = await client.get_consumers(walletAddress, 10, 5);
```

### get_consumer_count

Gets the total count of consumers in the system.

```typescript
get_consumer_count(wallet_address: string): Promise<number>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information

**Returns:** Promise resolving to the total number of consumers

**Example:**
```typescript
const count = await client.get_consumer_count(walletAddress);
```

### get_consumer_reservations

Retrieves all reservations associated with a consumer.

```typescript
get_consumer_reservations(wallet_address: string, consumer_address: string): Promise<StorageReservation[]>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `consumer_address` (string): Address of the consumer

**Returns:** Promise resolving to an array of StorageReservation objects

**Example:**
```typescript
const reservations = await client.get_consumer_reservations(walletAddress, consumerAddress);
```

### register_consumer

Registers a new consumer in the system. **Requires signature.**

```typescript
register_consumer(wallet_address: string, consumer_address: string, consumer_description: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet registering the consumer
- `consumer_address` (string): Address for the new consumer
- `consumer_description` (string): Description of the consumer

**Returns:** Promise resolving to the registration transaction result

**Example:**
```typescript
const result = await client.register_consumer(
  walletAddress,
  newConsumerAddress,
  'Data archival consumer'
);
```

### update_consumer

Updates consumer information. **Requires signature.**

```typescript
update_consumer(wallet_address: string, consumer_address: string, consumer_description: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `consumer_address` (string): Address of the consumer to update
- `consumer_description` (string): New description for the consumer

**Returns:** Promise resolving to the update transaction result

**Example:**
```typescript
const result = await client.update_consumer(
  walletAddress,
  consumerAddress,
  'Updated consumer description'
);
```

### delete_consumer

Deletes a consumer from the system. **Requires signature.**

```typescript
delete_consumer(wallet_address: string, consumer_address: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `consumer_address` (string): Address of the consumer to delete

**Returns:** Promise resolving to the deletion transaction result

**Example:**
```typescript
const result = await client.delete_consumer(walletAddress, consumerAddress);
```

## Storage Unit Methods

### register_unit

Registers a new storage unit in the system. **Requires signature.**

```typescript
register_unit(wallet_address: string, provider_address: string, capacity: number, endpoint: string): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet registering the unit
- `provider_address` (string): Address of the provider owning the unit
- `capacity` (number): Capacity of the storage unit in gigabytes
- `endpoint` (string): Endpoint for the storage unit

**Returns:** Promise resolving to the registration transaction result

**Example:**
```typescript
const result = await client.register_unit(
  walletAddress,
  providerAddress,
  1000, // 1TB capacity
  'https://storage.example.com/unit1'
);
```

### get_unit

Retrieves storage unit information.

```typescript
get_unit(wallet_address: string, unit_id: number, load_reservations?: boolean): Promise<StorageUnit>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `unit_id` (number): Identifier of the storage unit
- `load_reservations` (boolean, optional): Flag to include unit's reservations

**Returns:** Promise resolving to StorageUnit object

**Example:**
```typescript
const unit = await client.get_unit(walletAddress, 123, true);
console.log(`Unit capacity: ${unit.capacity}GB, Available: ${unit.available}GB`);
```

### get_unit_reservations

Retrieves all reservations for a specific storage unit.

```typescript
get_unit_reservations(wallet_address: string, unit_id: number): Promise<StorageReservation[]>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `unit_id` (number): Identifier of the storage unit

**Returns:** Promise resolving to an array of StorageReservation objects

**Example:**
```typescript
const reservations = await client.get_unit_reservations(walletAddress, unitId);
```

### delete_unit

Deletes a storage unit from the system. **Requires signature.**

```typescript
delete_unit(wallet_address: string, provider_address: string, unit_id: number): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider owning the unit
- `unit_id` (number): Identifier of the storage unit

**Returns:** Promise resolving to the deletion transaction result

**Throws:** Will throw if unit has active reservations

**Example:**
```typescript
const result = await client.delete_unit(walletAddress, providerAddress, unitId);
```

### enter_maintenance

Places a storage unit into maintenance mode. **Requires signature.**

```typescript
enter_maintenance(
  wallet_address: string,
  provider_address: string,
  unit_id: number,
  maintenance_start: Date,
  maintenance_end: Date
): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider owning the unit
- `unit_id` (number): Identifier of the storage unit
- `maintenance_start` (Date): Start date of maintenance period
- `maintenance_end` (Date): End date of maintenance period

**Returns:** Promise resolving to the maintenance transaction result

**Throws:** Will throw if unit has active reservations that conflict with the maintenance window

**Example:**
```typescript
const startDate = new Date('2024-01-15T00:00:00Z');
const endDate = new Date('2024-01-16T00:00:00Z');

const result = await client.enter_maintenance(
  walletAddress,
  providerAddress,
  unitId,
  startDate,
  endDate
);
```

### exit_maintenance

Exits maintenance mode for a storage unit. **Requires signature.**

```typescript
exit_maintenance(wallet_address: string, provider_address: string, unit_id: number): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider owning the unit
- `unit_id` (number): Identifier of the storage unit

**Returns:** Promise resolving to the maintenance exit transaction result

**Throws:** Will throw if unit is not in maintenance mode

**Example:**
```typescript
const result = await client.exit_maintenance(walletAddress, providerAddress, unitId);
```

### enter_decommissioning

Places a storage unit into decommissioning mode. **Requires signature.**

```typescript
enter_decommissioning(wallet_address: string, provider_address: string, unit_id: number): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider owning the unit
- `unit_id` (number): Identifier of the storage unit

**Returns:** Promise resolving to the decommissioning transaction result

**Throws:** Will throw if unit has active reservations

**Example:**
```typescript
const result = await client.enter_decommissioning(walletAddress, providerAddress, unitId);
```

### exit_decommissioning

Exits decommissioning mode for a storage unit. **Requires signature.**

```typescript
exit_decommissioning(wallet_address: string, provider_address: string, unit_id: number): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider owning the unit
- `unit_id` (number): Identifier of the storage unit

**Returns:** Promise resolving to the decommissioning exit transaction result

**Throws:** Will throw if unit is not in decommissioning mode

**Example:**
```typescript
const result = await client.exit_decommissioning(walletAddress, providerAddress, unitId);
```

## Reservation Methods

### get_reservation

Retrieves information about a specific reservation.

```typescript
get_reservation(wallet_address: string, reservation_id: number): Promise<StorageReservation>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet requesting the information
- `reservation_id` (number): Identifier of the reservation

**Returns:** Promise resolving to StorageReservation object

**Example:**
```typescript
const reservation = await client.get_reservation(walletAddress, reservationId);
console.log(`Reserved: ${reservation.reserved_gb}GB, In use: ${reservation.inuse_bytes} bytes`);
```

### reserve_unit

Creates a new storage reservation. **Requires signature.**

```typescript
reserve_unit(
  wallet_address: string,
  consumer_address: string,
  unit_id: number,
  reserved_gb: number
): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `consumer_address` (string): Address of the consumer requesting storage
- `unit_id` (number): Identifier of the storage unit to reserve
- `reserved_gb` (number): Amount of storage to reserve in gigabytes

**Returns:** Promise resolving to the reservation creation transaction result

**Throws:** 
- Will throw if unit doesn't have enough available capacity
- Will throw if unit is in maintenance or decommissioning mode

**Example:**
```typescript
const result = await client.reserve_unit(
  walletAddress,
  consumerAddress,
  unitId,
  100 // Reserve 100GB
);
```

### delete_reservation

Deletes an existing reservation. **Requires signature.**

```typescript
delete_reservation(wallet_address: string, consumer_address: string, reservation_id: number): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `consumer_address` (string): Address of the consumer who owns the reservation
- `reservation_id` (number): Identifier of the reservation to delete

**Returns:** Promise resolving to the reservation deletion transaction result

**Throws:** Will throw if reservation has non-zero inuse_bytes

**Example:**
```typescript
const result = await client.delete_reservation(walletAddress, consumerAddress, reservationId);
```

### update_inuse_bytes_consumer

Updates the amount of storage currently in use by a consumer. **Requires signature.**

```typescript
update_inuse_bytes_consumer(
  wallet_address: string,
  consumer_address: string,
  reservation_id: number,
  inuse_bytes: number
): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `consumer_address` (string): Address of the consumer
- `reservation_id` (number): Identifier of the reservation
- `inuse_bytes` (number): Current number of bytes in use

**Returns:** Promise resolving to the update transaction result

**Throws:** Will throw if inuse_bytes exceeds reserved amount

**Example:**
```typescript
const result = await client.update_inuse_bytes_consumer(
  walletAddress,
  consumerAddress,
  reservationId,
  50 * 1024 * 1024 * 1024 // 50GB in bytes
);
```

### update_inuse_bytes_provider

Updates the amount of storage currently in use, reported by provider. **Requires signature.**

```typescript
update_inuse_bytes_provider(
  wallet_address: string,
  provider_address: string,
  reservation_id: number,
  inuse_bytes: number
): Promise<TransactionResult>
```

**Parameters:**
- `wallet_address` (string): Address of the wallet making the request
- `provider_address` (string): Address of the provider
- `reservation_id` (number): Identifier of the reservation
- `inuse_bytes` (number): Current number of bytes in use

**Returns:** Promise resolving to the update transaction result

**Throws:** 
- Will throw if inuse_bytes exceeds reserved amount
- Will throw if provider's report differs significantly from consumer's report

**Example:**
```typescript
const result = await client.update_inuse_bytes_provider(
  walletAddress,
  providerAddress,
  reservationId,
  50 * 1024 * 1024 * 1024 // 50GB in bytes
);
```

## Error Handling

All methods may throw errors in the following scenarios:

- **Network errors**: Connection issues with the Stellar network
- **Transaction errors**: Invalid parameters or blockchain state conflicts
- **Signature errors**: Missing or invalid transaction signatures
- **Authorization errors**: Insufficient permissions for the operation

**Example error handling:**

```typescript
try {
  const result = await client.register_provider(
    walletAddress,
    providerAddress,
    'My Storage Provider'
  );
  console.log('Provider registered successfully:', result);
} catch (error) {
  if (error.message.includes('already registered')) {
    console.error('Provider address is already in use');
  } else {
    console.error('Registration failed:', error.message);
  }
}
```

## Transaction Signing

Methods marked with **"Requires signature"** need transaction signing. You can provide signing in two ways:

### 1. Custom Signing Function (Recommended for Wallet Integration)

```typescript
const client = new FlashOnStellarClient({
  contractAddress: 'your-contract-address',
  network: StellarNetwork.TESTNET,
  signTransaction: async (xdrToSign: string) => {
    // Use wallet kit or custom signing logic
    return await walletKit.signTransaction(xdrToSign);
  }
});
```

### 2. Direct Private Key Signing

```typescript
const client = new FlashOnStellarClient({
  contractAddress: 'your-contract-address',
  network: StellarNetwork.TESTNET
});

// Sign with private key when needed
const signedXdr = await client.signTransactionWithKey(xdrTransaction, privateKey);
``` 