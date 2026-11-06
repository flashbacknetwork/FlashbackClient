# @flashbacktech/flashbackclient

TypeScript/JavaScript client for:

- interacting with the FlashOnStellar storage system on the Stellar blockchain.
- offering your available storage capacity as a provider on the FlashOnStellar system.
- connecting your applications as a consumer of storage on the FlashOnStellar system.

## Installation

```bash
npm install @flashbacktech/flashbackclient
```

## 0.4.0 compatibility changes

This security update requires Node.js 22.13.0 or newer. The supported package
entrypoints are `/api`, `/gcs`, and `/stellarv2`.

- Stellar moves from 14 to the maintained 16.x branch. Consumers that pin or
  force an older Stellar version must update that constraint before integration.
- Google Storage moves to 8.x and Google Auth to 11.x.
  `FlashbackAuthClient.getRequestHeaders()` and `authorizeRequest().headers`
  now return native `Headers`; use `.get('authorization')` when reading them.
- GCS authentication is attached to each storage instance. Constructing or
  cleaning up a storage instance no longer replaces the process-wide `fetch`
  or Gaxios transport; `cleanup()` remains callable for compatibility.
- OAuth code exchange requires a nonce. A mailbox/browser challenge must be
  completed before using the first-party session and OAuth device endpoints.

Run `npm run test:offline` to compile and check OAuth, local GCS transport,
signed URLs, and Stellar transaction preparation/signing without cloud
credentials or submitting a blockchain transaction. The separate OpenAI
integration suite contacts a real provider and is not part of this command.

## Documentation

For comprehensive API documentation, examples, and usage instructions, see the [Documentation](./docs/index.md).

## Usage

### Client Library

```typescript
import { FlashOnStellarClient, StellarNetwork } from '@flashbacktech/flashbackclient/stellar';
```

See the [Stellar README](STELLAR.md) for usage instructions.

### Consumer API reference

See the [Consumer README](./src/consumer/README.md) for usage instructions.

### Provider API reference

See the [Provider README](./src/provider/README.md) for usage instructions.

## License

ISC © [2025] FlashBack Inc.
