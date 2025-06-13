# Flashback Client Library Documentation

## Overview

The Flashback Client Library provides a comprehensive TypeScript SDK for interacting with the Flashback decentralized storage system. This library offers two main client interfaces to facilitate different aspects of the platform:

1. **Stellar Blockchain Client** - Direct interaction with Stellar smart contracts for decentralized storage operations
2. **API Client** - Communication with the Flashback backend services for web application integration

## Architecture

The library is designed to support both decentralized blockchain operations and traditional web API interactions, providing flexibility for different use cases and integration scenarios.

## API Clients

### [Stellar Client](./stellar-client.md)
**File**: `src/stellar/client.ts`

The Stellar Client (`FlashOnStellarClient`) provides direct access to Stellar blockchain smart contracts for decentralized storage operations. This client handles:

- Provider and consumer registration and management
- Storage unit operations (registration, maintenance, decommissioning)
- Reservation management for storage allocation
- Direct blockchain transactions and signing
- Decentralized statistics and monitoring

**Use Case**: Applications that need direct blockchain interaction, decentralized operations, or want to bypass centralized services.

### [API Client](./api-client.md)
**File**: `src/api/client.ts`

The API Client (`ApiClient`) facilitates communication between frontend applications and the Flashback backend services. This client handles:

- User authentication and authorization
- Storage unit and repository management through REST APIs
- API key management for secure access
- Statistics and monitoring through web services
- OAuth2 integration with multiple providers

**Use Case**: Web applications, mobile apps, or services that prefer REST API integration with centralized backend services.

## Getting Started

Choose the appropriate client based on your integration needs:

- For **decentralized applications** or **direct blockchain interaction**, use the [Stellar Client](./stellar-client.md)
- For **web applications** or **REST API integration**, use the [API Client](./api-client.md)

## Authentication

Both clients support different authentication methods:

- **Stellar Client**: Uses Stellar wallet signatures and private keys
- **API Client**: Supports OAuth2 (Google, GitHub), Web3 Stellar, and local authentication

## Installation

```bash
npm install flashback-client
```

## Quick Example

```typescript
// Using Stellar Client
import { FlashOnStellarClient } from 'flashback-client/stellar';

const stellarClient = new FlashOnStellarClient({
  contractAddress: 'your-contract-address',
  network: StellarNetwork.TESTNET
});

// Using API Client
import { ApiClient } from 'flashback-client/api';

const apiClient = new ApiClient('https://api.flashback.tech');
```

## Support

For detailed method documentation, parameters, and examples, please refer to the individual client documentation pages linked above. 