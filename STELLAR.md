# @flashbacktech/flashonstellar

TypeScript/JavaScript client for interacting with the FlashOnStellar storage system on the Stellar blockchain.

## Installation

```bash
npm install @flashbacktech/flashonstellar
```

```typescript
import { FlashOnStellarClient, StellarNetwork } from '@flashbacktech/flashonstellar/client';

// Initialize the client
const client = new FlashOnStellarClient({
  contractAddress: 'CONTRACT_ADDRESS',
  network: StellarNetwork.TESTNET, // or StellarNetwork.PUBLIC for mainnet
  signTransaction: async (xdr: string): Promise<string> => {
    // Your transaction signing logic here
    // Example using a private key:
    return client.signTransactionWithKey(xdr, 'YOUR_PRIVATE_KEY');
    // Or integrate with Wallet Kit or other signing solutions
  },
});

// Provider Operations
// Register a new storage provider
await client.register_provider('WALLET_ADDRESS', 'PROVIDER_ADDRESS', 'Provider Description');

// Get provider information
const provider = await client.get_provider(
  'WALLET_ADDRESS',
  'PROVIDER_ADDRESS',
  true // Include units information
);

// List providers with pagination
const providers = await client.get_providers(
  'WALLET_ADDRESS',
  0, // skip
  10 // take
);

// Consumer Operations
// Register a new storage consumer
await client.register_consumer('WALLET_ADDRESS', 'CONSUMER_ADDRESS', 'Consumer Description');

// Get consumer information
const consumer = await client.get_consumer(
  'WALLET_ADDRESS',
  'CONSUMER_ADDRESS',
  true // Include reservations
);

// Unit Operations
// Get unit information
const unit = await client.get_unit(
  'WALLET_ADDRESS',
  123, // unit_id
  true // Include reservations
);

// Schedule maintenance
await client.enter_maintenance(
  'WALLET_ADDRESS',
  'PROVIDER_ADDRESS',
  123, // unit_id
  new Date('2024-04-01T02:00:00Z'),
  new Date('2024-04-01T04:00:00Z')
);

// Storage Operations
// Create a storage reservation
await client.reserve_unit(
  'WALLET_ADDRESS',
  'CONSUMER_ADDRESS',
  123, // unit_id
  100 // GB to reserve
);

// Update storage usage (consumer side)
await client.update_inuse_bytes_consumer(
  'WALLET_ADDRESS',
  'CONSUMER_ADDRESS',
  456, // reservation_id
  1024 * 1024 * 1024 // 1GB in bytes
);
```

## API Documentation

For detailed API documentation, please visit our [API Reference](https://flashbacktech.github.io/flashonstellar).

## Transaction Signing

The client supports two methods for transaction signing:

1. Using a private key:

```typescript
const signedXdr = await client.signTransactionWithKey(xdr, privateKey);
```

2. Using a custom signing function (recommended for production):

```typescript
const client = new FlashOnStellarClient({
  // ...
  signTransaction: async (xdr) => {
    // Integrate with your preferred wallet or signing solution
    return signedXdr;
  },
});
```

## Error Handling

All methods that interact with the blockchain can throw errors. It's recommended to wrap calls in try-catch blocks:

```typescript
try {
  await client.reserve_unit(wallet, consumer, unitId, gbToReserve);
} catch (error) {
  if (error.message.includes('insufficient capacity')) {
    // Handle capacity error
  }
  // Handle other errors
}
```

## Development

To contribute to this package:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build: `npm run build`

## License

MIT © [2025] FlashBack Inc.
