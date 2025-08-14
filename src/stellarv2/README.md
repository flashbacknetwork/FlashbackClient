# FlashOnStellar V2 Client

This directory contains the TypeScript client implementation for the FlashOnStellar V2 smart contract. The client is organized into operation-specific classes that provide a clean, organized interface to the contract's functionality.

## Architecture

The V2 client follows a modular architecture where each major operation type has its own class:

- **ConsumerOps** - Consumer registration and management
- **ProviderOps** - Provider registration and management  
- **BucketOps** - Storage bucket creation and management
- **DealOps** - Deal lifecycle management
- **FundingOps** - Funding and asset management (owner only)

## Main Client Class

The `FlashOnStellarClient` class orchestrates all operations and provides high-level methods for common use cases.

### Basic Usage

```typescript
import { FlashOnStellarClient, StellarNetwork } from './stellarv2';

const client = new FlashOnStellarClient({
  contractAddress: 'your_contract_address_here',
  network: { network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' },
  signTransaction: async (xdr) => {
    // Implement your transaction signing logic here
    return signedXdr;
  }
});

// Access operation classes
const { consumers, providers, buckets, deals, funding } = client;
```

## Operation Classes

### ConsumerOps

Handles all consumer-related operations:

```typescript
// Register a new consumer
await client.consumers.registerConsumer(
  'consumer_address',
  'Consumer description'
);

// Get consumer information
const consumer = await client.consumers.getConsumer('consumer_address');

// Get consumer deals
const deals = await client.consumers.getConsumerDeals('consumer_address');
```

### ProviderOps

Handles all provider-related operations:

```typescript
// Register a new provider
await client.providers.registerProvider(
  'provider_address',
  'Provider description'
);

// Get provider information
const provider = await client.providers.getProvider('provider_address');

// Get provider buckets
const buckets = await client.providers.getProviderBuckets('provider_address');
```

### BucketOps

Handles all bucket-related operations:

```typescript
// Create a new bucket
const bucketId = await client.buckets.createBucket('provider_address', {
  name: 'My Storage Bucket',
  region: 'us-east-1',
  country: 'US',
  versioning_enabled: true,
  fb_bucket_id: 'flashback_bucket_id',
  api_compatibility: 'S3',
  price_per_gb_storage: BigInt(1000000), // $0.10 per GB (scaled by 10^7)
  price_per_gb_egress: BigInt(500000)    // $0.05 per GB (scaled by 10^7)
});

// Get bucket information
const bucket = await client.buckets.getBucket('provider_address', bucketId);

// Update bucket pricing
await client.buckets.updateBucketPricing('provider_address', bucketId, {
  price_per_gb_storage: BigInt(1200000), // $0.12 per GB
  max_storage_gb: 1000
});
```

### DealOps

Handles all deal-related operations:

```typescript
// Create a new deal
const dealId = await client.deals.createDeal(
  'consumer_address',
  'provider_address',
  bucketId,
  {
    duration_secs: BigInt(86400), // 1 day
    agreed_storage_gb: 100,
    agreed_egress_gb: 50,
    fb_repo_id: 'flashback_repo_id',
    api_compatibility: 'S3'
  }
);

// Accept a deal (provider)
await client.deals.setDealAccepted(
  'consumer_address',
  'provider_address',
  dealId
);

// Fund a deal (consumer)
await client.deals.setDealFunded(
  'consumer_address',
  'provider_address',
  dealId,
  BigInt(10000000) // $1.00 (scaled by 10^7)
);

// Complete a deal
await client.deals.setDealCompleted(
  'consumer_address',
  'provider_address',
  dealId
);
```

### FundingOps

Handles funding operations (owner only):

```typescript
// Send funds to a receiver
await client.funding.sendFundsOwner(
  'receiver_address',
  BigInt(100000000) // $10.00 (scaled by 10^7)
);

// Test faucet (mint tokens)
await client.funding.testFaucetOwner(
  'receiver_address',
  BigInt(50000000) // $5.00 (scaled by 10^7)
);
```

## High-Level Methods

The main client provides several high-level methods for common operations:

```typescript
// Get system statistics
const stats = await client.getSystemStats();
console.log(`Total consumers: ${stats.consumerCount}`);
console.log(`Total providers: ${stats.providerCount}`);
console.log(`Total buckets: ${stats.bucketCount}`);
console.log(`Total deals: ${stats.dealCount}`);
console.log(`Active deals: ${stats.activeDealCount}`);

// Get comprehensive provider information
const providerInfo = await client.getProviderInfo('provider_address');
if (providerInfo) {
  console.log(`Provider: ${providerInfo.provider.description}`);
  console.log(`Buckets: ${providerInfo.buckets.length}`);
  console.log(`Deals: ${providerInfo.deals.length}`);
  console.log(`Active deals: ${providerInfo.activeDeals.length}`);
}

// Get comprehensive consumer information
const consumerInfo = await client.getConsumerInfo('consumer_address');
if (consumerInfo) {
  console.log(`Consumer: ${consumerInfo.consumer.description}`);
  console.log(`Deals: ${consumerInfo.deals.length}`);
  console.log(`Active deals: ${consumerInfo.activeDeals.length}`);
}
```

## Data Types

The client uses TypeScript interfaces that match the Rust contract types:

- **Consumer** - Consumer information and metadata
- **Provider** - Provider information and metadata
- **Bucket** - Storage bucket configuration and status
- **Deal** - Deal information and lifecycle state
- **BucketStatus** - Enum for bucket states (Active, Inactive, Deleted)
- **DealStatus** - Enum for deal states (Pending, Accepted, Funded, Completed, etc.)

## Error Handling

All methods return Promises and will throw errors for:
- Contract call failures
- Invalid parameters
- Network issues
- Authentication failures

```typescript
try {
  await client.consumers.registerConsumer('address', 'description');
} catch (error) {
  console.error('Failed to register consumer:', error);
}
```

## Transaction Signing

For write operations, you must provide a `signTransaction` callback:

```typescript
const client = new FlashOnStellarClient({
  contractAddress: 'your_contract_address',
  network: { network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' },
  signTransaction: async (xdrToSign) => {
    // Use your preferred signing method:
    // - Stellar SDK with private key
    // - Wallet integration
    // - Hardware wallet
    // - etc.
    
    // Return the signed XDR string
    return signedXdr;
  }
});
```

## Network Configuration

The client supports both testnet and mainnet:

```typescript
// Testnet
const testnetConfig = {
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015'
};

// Mainnet
const mainnetConfig = {
  network: 'PUBLIC',
  networkPassphrase: 'Public Global Stellar Network ; September 2015'
};
```

## Migration from V1

The V2 client introduces several improvements over V1:

1. **Organized Operations** - Clear separation of concerns with operation-specific classes
2. **Enhanced Types** - Better TypeScript support with comprehensive interfaces
3. **Bucket Management** - New bucket-based storage model instead of units
4. **Deal Lifecycle** - Comprehensive deal management with status tracking
5. **SLA Support** - Built-in SLA monitoring and enforcement
6. **Funding Integration** - Direct integration with stable assets for payments

## Examples

See the test files in the parent directory for comprehensive usage examples of the V2 client. 