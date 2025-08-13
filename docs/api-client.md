# API Client Documentation

## Overview

The `ApiClient` facilitates communication between frontend applications and the Flashback backend services through REST APIs. This client provides user authentication, storage management, and monitoring capabilities through centralized web services.

## Installation & Setup

```typescript
import { ApiClient, ProviderType } from 'flashback-client/api';

const client = new ApiClient('https://api.flashback.tech');

// Enable debug mode (optional)
client.setDebug(true);
```

## Configuration

### Constructor

```typescript
new ApiClient(baseURL?: string)
```

**Parameters:**
- `baseURL` (string, optional): Base URL for the API (default: 'https://api.flashback.tech')

### Utility Methods

#### setDebug

Enables or disables debug logging for API requests.

```typescript
setDebug(debug: boolean): void
```

**Parameters:**
- `debug` (boolean): Whether to enable debug logging

**Example:**
```typescript
client.setDebug(true); // Enable debug logging
```

#### setAuthToken

Sets the authentication token for API requests.

```typescript
setAuthToken(token: string | null): void
```

**Parameters:**
- `token` (string | null): JWT token for authentication, or null to remove

**Example:**
```typescript
client.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
```

## Authentication Methods

### authenticate

Authenticates with the specified provider using a token.

```typescript
authenticate(token: string, provider: ProviderType): Promise<any>
```

**Parameters:**
- `token` (string): Authentication token from the provider
- `provider` (ProviderType): Authentication provider type

**Provider Types:**
- `ProviderType.GOOGLE`: Google OAuth2
- `ProviderType.GITHUB`: GitHub OAuth2
- `ProviderType.WEB3_STELLAR`: Stellar Web3 authentication
- `ProviderType.LOCAL`: Local authentication (use `userLogin` instead)

**Returns:** Promise resolving to authentication response

**Example:**
```typescript
import { ProviderType } from 'flashback-client/api';

const result = await client.authenticate(googleToken, ProviderType.GOOGLE);
console.log('Authenticated:', result);
```

### exchangeCode

Exchanges an OAuth2 authorization code for tokens.

```typescript
exchangeCode(code: string, provider: ProviderType): Promise<OAuth2ResponseDTO>
```

**Parameters:**
- `code` (string): OAuth2 authorization code
- `provider` (ProviderType): OAuth2 provider

**Returns:** Promise resolving to OAuth2ResponseDTO with access and refresh tokens

**Example:**
```typescript
const tokens = await client.exchangeCode(authCode, ProviderType.GOOGLE);
console.log('Access token:', tokens.access_token);
console.log('Refresh token:', tokens.refresh_token);
```

### refreshToken

Refreshes an expired access token using a refresh token.

```typescript
refreshToken(refreshToken: string, provider: ProviderType): Promise<RefreshTokenResponse | RefreshTokenErrorResponse>
```

**Parameters:**
- `refreshToken` (string): Refresh token to use
- `provider` (ProviderType): Provider that issued the refresh token

**Returns:** Promise resolving to new tokens or error response

**Example:**
```typescript
try {
  const newTokens = await client.refreshToken(refreshToken, ProviderType.GOOGLE);
  if ('access_token' in newTokens) {
    client.setAuthToken(newTokens.access_token);
  }
} catch (error) {
  console.error('Token refresh failed:', error);
}
```

## User Management Methods

### userRegister

Registers a new user account with local authentication.

```typescript
userRegister(data: RegisterBody): Promise<RegisterResponse>
```

**RegisterBody Interface:**
```typescript
interface RegisterBody {
  email: string;           // User's email address
  password: string;        // User's password (minimum 8 characters)
  companyName: string;     // Name of the user's company
  companyDomain: string;   // Company domain (e.g., "example.com")
  companyWebsite: string;  // Company website URL
}
```

**Returns:** Promise resolving to RegisterResponse

**Example:**
```typescript
const result = await client.userRegister({
  email: 'user@example.com',
  password: 'securePassword123',
  companyName: 'Acme Corp',
  companyDomain: 'acme.com',
  companyWebsite: 'https://acme.com'
});
console.log('User registered:', result.user);
```

### userLogin

Authenticates a user with email and password.

```typescript
userLogin(data: LoginBody): Promise<LoginResponse>
```

**LoginBody Interface:**
```typescript
interface LoginBody {
  email: string;     // User's email address
  password: string;  // User's password
}
```

**Returns:** Promise resolving to LoginResponse with tokens

**Example:**
```typescript
const result = await client.userLogin({
  email: 'user@example.com',
  password: 'securePassword123'
});

client.setAuthToken(result.access_token);
console.log('Logged in successfully');
```

### userRefresh

Refreshes user tokens for local authentication.

```typescript
userRefresh(refreshToken: string): Promise<RefreshTokenResponse | RefreshTokenErrorResponse>
```

**Parameters:**
- `refreshToken` (string): User's refresh token

**Returns:** Promise resolving to new tokens or error response

**Example:**
```typescript
const newTokens = await client.userRefresh(userRefreshToken);
if ('access_token' in newTokens) {
  client.setAuthToken(newTokens.access_token);
}
```

### userLogout

Logs out a user and invalidates their refresh token.

```typescript
userLogout(refreshToken: string): Promise<LogoutResponse>
```

**Parameters:**
- `refreshToken` (string): User's refresh token to invalidate

**Returns:** Promise resolving to LogoutResponse

**Example:**
```typescript
await client.userLogout(refreshToken);
client.setAuthToken(null);
console.log('Logged out successfully');
```

### userActivate

Activates the current user account.

```typescript
userActivate(): Promise<ActivateResponse>
```

**Returns:** Promise resolving to ActivateResponse

**Example:**
```typescript
const result = await client.userActivate();
console.log('Account activated:', result.success);
```

### userDeactivate

Deactivates the current user account.

```typescript
userDeactivate(): Promise<DeactivateResponse>
```

**Returns:** Promise resolving to DeactivateResponse

**Example:**
```typescript
const result = await client.userDeactivate();
console.log('Account deactivated:', result.success);
```

## Storage Unit Methods

### createStorageUnit

Creates a new storage unit.

```typescript
createStorageUnit(data: CreateUnitRequest): Promise<CreateUnitResponse>
```

**CreateUnitRequest Interface:**
```typescript
interface CreateUnitRequest {
  name: string;           // Display name for the storage unit
  bucket: string;         // Storage bucket/container name
  storageType: StorageType; // Type of storage (S3, GCS, BLOB)
  key: string;            // Access key/credential for the storage
  secret: string;         // Secret key/credential for the storage
  endpoint?: string;      // Custom endpoint URL (for S3-compatible storage)
  region?: string;        // Storage region (e.g., "us-east-1")
}

enum StorageType {
  S3 = 'S3',       // Amazon S3 or S3-compatible storage
  GCS = 'GCS',     // Google Cloud Storage
  BLOB = 'BLOB'    // Azure Blob Storage
}
```

**Returns:** Promise resolving to CreateUnitResponse with the created unit

**Example:**
```typescript
const unit = await client.createStorageUnit({
  name: 'Primary Storage Unit',
  bucket: 'my-storage-bucket',
  storageType: StorageType.S3,
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  endpoint: 'https://s3.amazonaws.com',
  region: 'us-east-1'
});
console.log('Unit created:', unit.id);
```

### getStorageUnits

Retrieves all storage units for the authenticated user.

```typescript
getStorageUnits(): Promise<GetUnitsResponse>
```

**Returns:** Promise resolving to GetUnitsResponse containing array of StorageUnit objects

**GetUnitsResponse Interface:**
```typescript
interface GetUnitsResponse {
  success: boolean;     // Whether the request was successful
  units: StorageUnit[]; // Array of storage units
}

interface StorageUnit {
  id: string;           // Unique identifier for the storage unit
  name: string;         // Display name of the storage unit
  bucket: string;       // Storage bucket/container name
  storageType: StorageType; // Type of storage (S3, GCS, BLOB)
  key: string;          // Access key/credential for the storage
  secret?: EncryptedKey; // Encrypted secret key (not shown in responses)
  endpoint?: string;    // Custom endpoint URL
  region?: string;      // Storage region
  status?: string;      // Current status of the unit
  projectId?: string;   // Project ID (for GCS)
  createdAt: string;    // ISO timestamp of creation
}
```

**Example:**
```typescript
const response = await client.getStorageUnits();
response.units.forEach(unit => {
  console.log(`Unit ${unit.id}: ${unit.name} (${unit.capacity}GB)`);
});
```

### updateStorageUnit

Updates an existing storage unit.

```typescript
updateStorageUnit(unitId: string, data: UpdateUnitRequest): Promise<UpdateUnitResponse>
```

**Parameters:**
- `unitId` (string): ID of the unit to update
- `data` (UpdateUnitRequest): Updated unit data

**UpdateUnitRequest Interface:**
```typescript
interface UpdateUnitRequest {
  name: string;           // Display name for the storage unit
  bucket: string;         // Storage bucket/container name
  storageType: StorageType; // Type of storage (S3, GCS, BLOB)
  key: string;            // Access key/credential for the storage
  secret: string;         // Secret key/credential for the storage
  endpoint?: string;      // Custom endpoint URL (for S3-compatible storage)
  region?: string;        // Storage region (e.g., "us-east-1")
}
```

**Returns:** Promise resolving to UpdateUnitResponse

**Example:**
```typescript
const result = await client.updateStorageUnit('unit-123', {
  name: 'Updated Storage Unit',
  bucket: 'my-updated-bucket',
  storageType: StorageType.S3,
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region: 'us-west-2'
});
```

### deleteStorageUnit

Deletes a storage unit.

```typescript
deleteStorageUnit(unitId: string): Promise<ActionResponse>
```

**Parameters:**
- `unitId` (string): ID of the unit to delete

**Returns:** Promise resolving to ActionResponse

**Example:**
```typescript
const result = await client.deleteStorageUnit('unit-123');
console.log('Unit deleted:', result.success);
```

### validateStorageUnit

Validates a storage unit's configuration and connectivity.

```typescript
validateStorageUnit(unitId: string, data: ValidateUnitRequest): Promise<ValidateUnitResponse>
```

**Parameters:**
- `unitId` (string): ID of the unit to validate
- `data` (ValidateUnitRequest): Validation parameters

**ValidateUnitRequest Interface:**
```typescript
interface ValidateUnitRequest {
  key: string;        // Access key/credential for the storage
  secret: string;     // Secret key/credential for the storage
  endpoint?: string;  // Custom endpoint URL (for S3-compatible storage)
  bucket: string;     // Storage bucket/container name to validate
}
```

**Returns:** Promise resolving to ValidateUnitResponse

**Example:**
```typescript
const validation = await client.validateStorageUnit('unit-123', {
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  endpoint: 'https://s3.amazonaws.com',
  bucket: 'my-storage-bucket'
});
console.log('Validation result:', validation.isValid);
```

### getAvailableStorageUnits

Retrieves all available storage units in the network.

```typescript
getAvailableStorageUnits(): Promise<StorageUnit[]>
```

**Returns:** Promise resolving to array of available StorageUnit objects

**Example:**
```typescript
const availableUnits = await client.getAvailableStorageUnits();
console.log(`Found ${availableUnits.length} available units`);
```

### getStorageUnitStatus

Gets the current status of a storage unit.

```typescript
getStorageUnitStatus(unitId: string): Promise<StorageUnitStatusResponse>
```

**Parameters:**
- `unitId` (string): ID of the unit to check

**Returns:** Promise resolving to StorageUnitStatusResponse

**Example:**
```typescript
const status = await client.getStorageUnitStatus('unit-123');
console.log(`Unit status: ${status.status}, Uptime: ${status.uptime}`);
```

### getUnitNodeStats

Retrieves node statistics for a storage unit.

```typescript
getUnitNodeStats(unitId: string, data: GetUnitNodeStatsRequest): Promise<GetUnitNodeStatsResponse>
```

**Parameters:**
- `unitId` (string): ID of the unit
- `data` (GetUnitNodeStatsRequest): Statistics query parameters

**GetUnitNodeStatsRequest Interface:**
```typescript
interface GetUnitNodeStatsRequest {
  day: Date;  // Specific day to get node statistics for
}
```

**Returns:** Promise resolving to GetUnitNodeStatsResponse

**Example:**
```typescript
const stats = await client.getUnitNodeStats('unit-123', {
  day: new Date('2024-01-15')
});
console.log('Node stats:', stats.nodeStats);
```

## Storage Repository Methods

### createStorageRepo

Creates a new storage repository.

```typescript
createStorageRepo(data: CreateRepoRequest): Promise<CreateRepoResponse>
```

**CreateRepoRequest Interface:**
```typescript
interface CreateRepoRequest {
  name: string;           // Display name for the repository
  storageType: StorageType; // Type of storage (S3, GCS, BLOB)
  mode: ModeType;         // Repository mode (NORMAL or MIRROR)
  repoUnits: RepoUnitInfo[]; // Array of storage units configuration
}

enum ModeType {
  NORMAL = 'NORMAL',  // Standard repository mode
  MIRROR = 'MIRROR'   // Mirror/backup repository mode
}

interface RepoUnitInfo {
  folder: string;   // Folder path within the storage unit
  master: boolean;  // Whether this unit is the master (for MIRROR mode)
  unitId?: string;  // ID of the storage unit (optional for validation)
  unit?: StorageUnit; // Full unit object (populated in responses)
}
```

**Returns:** Promise resolving to CreateRepoResponse

**Example:**
```typescript
const repo = await client.createStorageRepo({
  name: 'My Data Repository',
  storageType: StorageType.S3,
  mode: ModeType.NORMAL,
  repoUnits: [
    {
      folder: '/data/primary',
      master: true,
      unitId: 'unit-123'
    },
    {
      folder: '/data/backup',
      master: false,
      unitId: 'unit-456'
    }
  ]
});
console.log('Repository created:', repo.id);
```

### getStorageRepos

Retrieves all storage repositories for the authenticated user.

```typescript
getStorageRepos(): Promise<GetReposResponse>
```

**Returns:** Promise resolving to GetReposResponse containing array of StorageRepo objects

**GetReposResponse Interface:**
```typescript
interface GetReposResponse {
  success: boolean;      // Whether the request was successful
  repos: StorageRepo[];  // Array of storage repositories
}

interface StorageRepo {
  id: string;            // Unique identifier for the repository
  name: string;          // Display name of the repository
  storageType: StorageType; // Type of storage (S3, GCS, BLOB)
  mode: ModeType;        // Repository mode (NORMAL or MIRROR)
  units: RepoUnitInfo[]; // Array of storage units in this repository
  apiKeys?: ApiKey[];    // Array of API keys (if included)
  createdAt: string;     // ISO timestamp of creation
}
```

**Example:**
```typescript
const response = await client.getStorageRepos();
response.repos.forEach(repo => {
  console.log(`Repo ${repo.id}: ${repo.name}`);
});
```

### updateStorageRepo

Updates an existing storage repository.

```typescript
updateStorageRepo(repoId: string, data: UpdateRepoRequest): Promise<UpdateRepoResponse>
```

**Parameters:**
- `repoId` (string): ID of the repository to update
- `data` (UpdateRepoRequest): Updated repository data

**UpdateRepoRequest Interface:**
```typescript
interface UpdateRepoRequest {
  name: string;           // Display name for the repository
  storageType: StorageType; // Type of storage (S3, GCS, BLOB)
  mode: ModeType;         // Repository mode (NORMAL or MIRROR)
  repoUnits: RepoUnitInfo[]; // Array of storage units configuration
}
```

**Returns:** Promise resolving to UpdateRepoResponse

**Example:**
```typescript
const result = await client.updateStorageRepo('repo-123', {
  name: 'Updated Repository Name',
  storageType: StorageType.S3,
  mode: ModeType.NORMAL,
  repoUnits: [
    {
      folder: '/data/primary',
      master: true,
      unitId: 'unit-123'
    },
    {
      folder: '/data/backup',
      master: false,
      unitId: 'unit-456'
    },
    {
      folder: '/data/archive',
      master: false,
      unitId: 'unit-789'
    }
  ]
});
```

### deleteStorageRepo

Deletes a storage repository.

```typescript
deleteStorageRepo(repoId: string): Promise<ActionResponse>
```

**Parameters:**
- `repoId` (string): ID of the repository to delete

**Returns:** Promise resolving to ActionResponse

**Example:**
```typescript
const result = await client.deleteStorageRepo('repo-123');
console.log('Repository deleted:', result.success);
```

### validateNewRepoUnits

Validates storage units for a new repository.

```typescript
validateNewRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>
```

**Parameters:**
- `data` (ValidateRepoUnitsRequest): Validation request data

**ValidateRepoUnitsRequest Interface:**
```typescript
interface ValidateRepoUnitsRequest {
  repoId: string;         // ID of the repository (required for validation)
  mode: ModeType;         // Repository mode (NORMAL or MIRROR)
  repoUnits: RepoUnitInfo[]; // Array of storage units to validate
}
```

**Returns:** Promise resolving to ValidateRepoUnitsResponse

**Example:**
```typescript
const validation = await client.validateNewRepoUnits({
  repoId: 'new-repo',
  mode: ModeType.NORMAL,
  repoUnits: [
    {
      folder: '/data/primary',
      master: true,
      unitId: 'unit-123'
    },
    {
      folder: '/data/backup',
      master: false,
      unitId: 'unit-456'
    }
  ]
});
console.log('Units valid for repository:', validation.isValid);
```

### validateUpdateRepoUnits

Validates storage units for updating an existing repository.

```typescript
validateUpdateRepoUnits(data: ValidateRepoUnitsRequest): Promise<ValidateRepoUnitsResponse>
```

**Parameters:**
- `data` (ValidateRepoUnitsRequest): Validation request data (must include repoId)

**Returns:** Promise resolving to ValidateRepoUnitsResponse

**Example:**
```typescript
const validation = await client.validateUpdateRepoUnits({
  repoId: 'repo-123',
  mode: ModeType.NORMAL,
  repoUnits: [
    {
      folder: '/data/primary',
      master: true,
      unitId: 'unit-123'
    },
    {
      folder: '/data/backup',
      master: false,
      unitId: 'unit-456'
    },
    {
      folder: '/data/archive',
      master: false,
      unitId: 'unit-789'
    }
  ]
});
```

## API Key Management Methods

### createRepoKey

Creates a new API key for a repository.

```typescript
createRepoKey(data: CreateRepoKeyRequest): Promise<CreateRepoKeyResponse>
```

**CreateRepoKeyRequest Interface:**
```typescript
interface CreateRepoKeyRequest {
  repoId: string;       // ID of the repository to create the key for
  name: string;         // Display name for the API key
  accessType: AccessType; // Access level for the key
}

enum AccessType {
  READ = 'READ',    // Read-only access
  WRITE = 'WRITE',  // Read and write access
  ADMIN = 'ADMIN'   // Full administrative access
}
```

**Returns:** Promise resolving to CreateRepoKeyResponse

**Example:**
```typescript
const apiKey = await client.createRepoKey({
  repoId: 'repo-123',
  name: 'Production API Key',
  accessType: AccessType.WRITE
});
console.log('API Key created:', apiKey.key);
```

### getRepoKeys

Retrieves all API keys for a repository.

```typescript
getRepoKeys(repoId: string): Promise<GetRepoKeysResponse>
```

**Parameters:**
- `repoId` (string): ID of the repository

**Returns:** Promise resolving to GetRepoKeysResponse containing array of ApiKey objects

**GetRepoKeysResponse Interface:**
```typescript
interface GetRepoKeysResponse {
  success: boolean;  // Whether the request was successful
  keys: ApiKey[];    // Array of API keys
}

interface ApiKey {
  id: string;        // Unique identifier for the API key
  name: string;      // Display name of the API key
  accessType: AccessType; // Access level (READ, WRITE, ADMIN)
  key: string;       // The actual API key string
  secret?: EncryptedKey; // Encrypted secret (not shown in responses)
  createdAt: string; // ISO timestamp of creation
}
```

**Example:**
```typescript
const response = await client.getRepoKeys('repo-123');
response.keys.forEach(key => {
  console.log(`Key ${key.id}: ${key.name} (${key.accessType})`);
});
```

### updateRepoKey

Updates an existing API key.

```typescript
updateRepoKey(repoId: string, keyId: string, data: UpdateRepoKeyRequest): Promise<UpdateRepoKeyResponse>
```

**Parameters:**
- `repoId` (string): ID of the repository
- `keyId` (string): ID of the API key to update
- `data` (UpdateRepoKeyRequest): Updated key data

**UpdateRepoKeyRequest Interface:**
```typescript
interface UpdateRepoKeyRequest {
  name: string;         // Display name for the API key
  accessType: AccessType; // Access level for the key
}
```

**Returns:** Promise resolving to UpdateRepoKeyResponse

**Example:**
```typescript
const result = await client.updateRepoKey('repo-123', 'key-456', {
  name: 'Updated API Key Name',
  accessType: AccessType.READ
});
```

### deleteRepoKey

Deletes an API key.

```typescript
deleteRepoKey(repoId: string, keyId: string): Promise<ActionResponse>
```

**Parameters:**
- `repoId` (string): ID of the repository
- `keyId` (string): ID of the API key to delete

**Returns:** Promise resolving to ActionResponse

**Example:**
```typescript
const result = await client.deleteRepoKey('repo-123', 'key-456');
console.log('API Key deleted:', result.success);
```

## Statistics Methods

### getDailyStats

Retrieves daily statistics for storage usage.

```typescript
getDailyStats(params: StatsQueryParams): Promise<StatsResponse>
```

**StatsQueryParams Interface:**
```typescript
interface StatsQueryParams {
  startDate?: Date;   // Start date for the statistics query (optional)
  endDate?: Date;     // End date for the statistics query (optional)
  repoId?: string[];  // Array of repository IDs to filter by (optional)
  unitId?: string[];  // Array of unit IDs to filter by (optional)
  hosts?: string[];   // Array of host names to filter and group statistics by (optional)
}
```

**Returns:** Promise resolving to StatsResponse with daily statistics

**StatsResponse Interface:**
```typescript
interface StatsResponse {
  success: boolean;    // Whether the request was successful
  data: StatsData[];   // Array of statistics data points
  message?: string;    // Optional message or error description
}

interface StatsData {
  timestamp: number;   // Unix timestamp of the data point
  repoId: string;      // Repository ID
  unitId: string;      // Storage unit ID
  upl_bytes: bigint;   // Bytes uploaded
  dwl_bytes: bigint;   // Bytes downloaded
  size_change: bigint; // Change in storage size
  latency_ms: number;  // Latency in milliseconds
  host: string;        // Host name associated with this data point
}
```

**Example:**
```typescript
const stats = await client.getDailyStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  repoId: ['repo-123'],
  hosts: ['host1.example.com', 'host2.example.com'] // Optional: filter by specific hosts
});
console.log('Daily stats:', stats.data);
```

### getMinuteStats

Retrieves minute-level statistics for storage usage.

```typescript
getMinuteStats(params: StatsQueryParams): Promise<StatsResponse>
```

**Parameters:**
- `params` (StatsQueryParams): Query parameters for statistics

**Returns:** Promise resolving to StatsResponse with minute-level statistics

**Example:**
```typescript
const stats = await client.getMinuteStats({
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  endDate: new Date(),
  unitId: ['unit-123'],
  hosts: ['host1.example.com'] // Optional: filter by specific hosts
});
```

### getNodeStatsMinute

Retrieves minute-level node statistics.

```typescript
getNodeStatsMinute(params: NodeStatsQueryParams): Promise<NodeStatsMinuteResponse>
```

**NodeStatsQueryParams Interface:**
```typescript
interface NodeStatsQueryParams {
  unitId: string[];     // Array of unit IDs to filter node stats by
}
```

**Returns:** Promise resolving to NodeStatsMinuteResponse

**NodeStatsMinuteResponse Interface:**
```typescript
interface NodeStatsMinuteResponse {
  success: boolean;              // Whether the request was successful
  data: NodeStatsMinuteData[];   // Array of minute-level node statistics
  message?: string;              // Optional message or error description
}

interface NodeStatsMinuteData {
  nodeId: string;      // Unique identifier for the node
  unitId: string;      // Storage unit ID this node belongs to
  nodeStatus: string;  // Current status of the node
  lastUpdated: Date;   // Last time the node was updated
  latency_ms: number;  // Current latency in milliseconds
}
```

**Example:**
```typescript
const nodeStats = await client.getNodeStatsMinute({
  unitId: ['unit-123', 'unit-456']
});
nodeStats.data.forEach(stat => {
  console.log(`Node ${stat.nodeId}: ${stat.nodeStatus}, Latency: ${stat.latency_ms}ms`);
});
```

### getNodeStatsDaily

Retrieves daily node statistics.

```typescript
getNodeStatsDaily(params: NodeStatsDailyQueryParams): Promise<NodeStatsDailyResponse>
```

**Parameters:**
- `params` (NodeStatsQueryParams): Query parameters
  - `unitId` (string[]): Array of unit IDs to filter node stats by
  - `startDate` (Date, optional): Start date for the statistics query
  - `endDate` (Date, optional): End date for the statistics query

**Returns:** Promise resolving to NodeStatsDailyResponse

**NodeStatsDailyResponse Interface:**
```typescript
interface NodeStatsDailyResponse {
  success: boolean;             // Whether the request was successful
  data: NodeStatsDailyData[];   // Array of daily node statistics
  message?: string;             // Optional message or error description
}

interface NodeStatsDailyData {
  nodeId: string;     // Unique identifier for the node
  unitId: string;     // Storage unit ID this node belongs to
  day: number;        // Day number (Unix timestamp)
  online: number;     // Percentage of time online (0-100)
  latency_ms: number; // Average latency for the day in milliseconds
}
```

**Example:**
```typescript
const dailyNodeStats = await client.getNodeStatsDaily({
  unitId: ['unit-123', 'unit-456'],
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});
console.log('Daily node statistics:', dailyNodeStats.data);
```

### getRepoStats

Retrieves statistics for specific repositories.

```typescript
getRepoStats(params?: {repoId?: string[]}): Promise<RepoStatsResponse>
```

**Parameters:**
- `params` (object, optional): Query parameters
  - `repoId` (string[], optional): Array of repository IDs to get statistics for

**Returns:** Promise resolving to RepoStatsResponse

**Example:**
```typescript
const repoStats = await client.getRepoStats({
  repoId: ['repo-123', 'repo-456']
});
console.log('Repository statistics:', repoStats);
```

### getUnitStats

Retrieves statistics for specific storage units.

```typescript
getUnitStats(params?: {unitId?: string[]}): Promise<UnitStatsResponse>
```

**Parameters:**
- `params` (object, optional): Query parameters
  - `unitId` (string[], optional): Array of storage unit IDs to get statistics for

**Returns:** Promise resolving to UnitStatsResponse

**Example:**
```typescript
const unitStats = await client.getUnitStats({
  unitId: ['unit-123', 'unit-456']
});
console.log('Storage unit statistics:', unitStats);
```

### getNodeInfo

Retrieves information about all nodes in the network.

```typescript
getNodeInfo(): Promise<NodeInfo[]>
```

**Returns:** Promise resolving to array of NodeInfo objects

**NodeInfo Interface:**
```typescript
interface NodeInfo {
  ip: string;           // IP address of the node
  region: string;       // Geographic region of the node
  version: string;      // Software version running on the node
  status: string;       // Current status of the node (ONLINE, OFFLINE, DISCONNECTED)
  latencyMs?: number;   // Current latency to the node in milliseconds (optional)
  lastUpdated: string;  // ISO timestamp of when the node was last updated
  url: string;          // URL endpoint of the node
}
```

**Example:**
```typescript
const nodeInfo = await client.getNodeInfo();
nodeInfo.forEach(node => {
  console.log(`Node ${node.ip}: ${node.status} (${node.region})`);
  console.log(`  Version: ${node.version}`);
  console.log(`  Latency: ${node.latencyMs || 'N/A'}ms`);
  console.log(`  URL: ${node.url}`);
});
```

## Subscription Management Methods

### getSubscriptions

Retrieves all available subscription plans.

```typescript
getSubscriptions(): Promise<GetSubscriptionsResponse>
```

**Returns:** Promise resolving to GetSubscriptionsResponse containing available subscription plans

**GetSubscriptionsResponse Interface:**
```typescript
interface GetSubscriptionsResponse {
  success: boolean;            // Whether the request was successful
  data: SubscriptionResponse[]; // Array of available subscriptions
}

interface SubscriptionResponse {
  id: string;                           // Subscription ID
  name: string;                         // Subscription name
  description: string;                  // Subscription description
  periods: SubscriptionPeriodResponse[]; // Available billing periods
}

interface SubscriptionPeriodResponse {
  id: string;           // Period ID
  subscriptionId: string; // Parent subscription ID
  periodType: string;   // Period type (e.g., 'MONTHLY', 'YEARLY')
  price: number;        // Price for this period
}
```

**Example:**
```typescript
const subscriptions = await client.getSubscriptions();
subscriptions.data.forEach(sub => {
  console.log(`${sub.name}: ${sub.description}`);
  sub.periods.forEach(period => {
    console.log(`  ${period.periodType}: $${period.price}`);
  });
});
```

### getMySubscription

Retrieves the current user's active subscription.

```typescript
getMySubscription(): Promise<MySubscriptionResponse>
```

**Returns:** Promise resolving to MySubscriptionResponse with current subscription details

**MySubscriptionResponse Interface:**
```typescript
interface MySubscriptionResponse {
  success: boolean;                    // Whether the request was successful
  data: OrgSubscriptionResponse | null; // Current subscription or null if none
  message?: string;                    // Optional message
}

interface OrgSubscriptionResponse {
  id: string;         // Subscription ID
  name: string;       // Subscription name
  description: string; // Subscription description
  periodId: string;   // Current period ID
  periodType: string; // Current period type
  price: number;      // Current price
  dateFrom: string;   // Start date (ISO string)
  dateTo: string | null; // End date (ISO string) or null if ongoing
  status: string;     // Subscription status
  autoRenew: boolean; // Whether auto-renewal is enabled
}
```

**Example:**
```typescript
const mySubscription = await client.getMySubscription();
if (mySubscription.data) {
  console.log(`Current plan: ${mySubscription.data.name}`);
  console.log(`Status: ${mySubscription.data.status}`);
  console.log(`Price: $${mySubscription.data.price} (${mySubscription.data.periodType})`);
  console.log(`Auto-renew: ${mySubscription.data.autoRenew ? 'Yes' : 'No'}`);
} else {
  console.log('No active subscription');
}
```

### buySubscription

Purchases a subscription plan for the current user.

```typescript
buySubscription(data: BuySubscriptionRequest): Promise<BuySubscriptionResponse>
```

**BuySubscriptionRequest Interface:**
```typescript
interface BuySubscriptionRequest {
  subscriptionPeriodId: string; // ID of the subscription period to purchase
}
```

**Returns:** Promise resolving to BuySubscriptionResponse with payment information

**BuySubscriptionResponse Interface:**
```typescript
interface BuySubscriptionResponse {
  success: boolean;      // Whether the request was successful
  clientSecret?: string; // Stripe client secret for payment processing
  sessionId?: string;    // Stripe session ID for checkout
  message?: string;      // Optional message
  error_code?: string;   // Error code if purchase failed
}
```

**Example:**
```typescript
const purchase = await client.buySubscription({
  subscriptionPeriodId: 'period-123'
});

if (purchase.success) {
  if (purchase.clientSecret) {
    // Handle Stripe payment with client secret
    console.log('Payment required - client secret:', purchase.clientSecret);
  } else if (purchase.sessionId) {
    // Redirect to Stripe checkout
    console.log('Redirect to checkout - session ID:', purchase.sessionId);
  }
} else {
  console.error('Purchase failed:', purchase.message);
}
```

### getPayments

Retrieves payment history for the current user's organization.

```typescript
getPayments(params?: PaymentsQueryParams): Promise<PaymentsListResponse>
```

**PaymentsQueryParams Interface:**
```typescript
interface PaymentsQueryParams {
  startDate?: string; // Start date for filtering payments (ISO string format)
  endDate?: string;   // End date for filtering payments (ISO string format)
}
```

**Returns:** Promise resolving to PaymentsListResponse with payment history

**PaymentsListResponse Interface:**
```typescript
interface PaymentsListResponse {
  success: boolean;           // Whether the request was successful
  data?: PaymentResponse[];   // Array of payment records (optional)
  message?: string;           // Optional message or error description
  error_code?: string;        // Error code if request failed
}

interface PaymentResponse {
  id: string;        // Unique payment identifier
  amount: number;    // Payment amount
  currency: string;  // Payment currency (e.g., 'usd')
  status: string;    // Payment status (e.g., 'COMPLETED', 'PENDING', 'FAILED')
  timestamp: string; // Payment timestamp (ISO string)
}
```

**Example:**
```typescript
// Get all payments
const allPayments = await client.getPayments();
if (allPayments.success && allPayments.data) {
  allPayments.data.forEach(payment => {
    console.log(`Payment ${payment.id}: $${payment.amount} ${payment.currency}`);
    console.log(`  Status: ${payment.status}`);
    console.log(`  Date: ${payment.timestamp}`);
  });
}

// Get payments for a specific date range
const recentPayments = await client.getPayments({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z'
});
console.log('January payments:', recentPayments.data);
```

### cancelSubscription

Cancels the current user's active subscription.

```typescript
cancelSubscription(): Promise<CancelSubscriptionResponse>
```

**Returns:** Promise resolving to CancelSubscriptionResponse

**CancelSubscriptionResponse Interface:**
```typescript
interface CancelSubscriptionResponse {
  success: boolean;    // Whether the cancellation was successful
  message?: string;    // Optional message or confirmation
  error_code?: string; // Error code if cancellation failed
}
```

**Example:**
```typescript
try {
  const result = await client.cancelSubscription();
  
  if (result.success) {
    console.log('Subscription cancelled successfully');
    console.log('Message:', result.message);
  } else {
    console.error('Cancellation failed:', result.message);
    console.error('Error code:', result.error_code);
  }
} catch (error) {
  if (error instanceof HttpError) {
    if (error.status === 404) {
      console.log('No active subscription found to cancel');
    } else if (error.status === 400) {
      console.log('Subscription cannot be cancelled (may already be cancelled)');
    } else {
      console.error('Cancellation error:', error.message);
    }
  }
}
```

## Error Handling

The API client throws `HttpError` instances for HTTP-related errors:

```typescript
export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: ErrorResponse
  )
}
```

**Example error handling:**

```typescript
try {
  const units = await client.getStorageUnits();
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
    console.error('Error details:', error.data);
    
    if (error.status === 401) {
      // Handle authentication error
      console.log('Please log in again');
    } else if (error.status === 403) {
      // Handle authorization error
      console.log('Insufficient permissions');
    }
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Complete Usage Example

```typescript
import { ApiClient, ProviderType } from 'flashback-client/api';

async function example() {
  const client = new ApiClient('https://api.flashback.tech');
  
  try {
    // Login
    const loginResult = await client.userLogin({
      email: 'user@example.com',
      password: 'password123'
    });
    
    client.setAuthToken(loginResult.access_token);
    
    // Create a storage unit
    const unit = await client.createStorageUnit({
      name: 'My Storage Unit',
      bucket: 'my-app-storage',
      storageType: StorageType.S3,
      key: 'AKIAIOSFODNN7EXAMPLE',
      secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      region: 'us-east-1'
    });
    
    // Create a repository
    const repo = await client.createStorageRepo({
      name: 'My Repository',
      storageType: StorageType.S3,
      mode: ModeType.NORMAL,
      repoUnits: [{
        folder: '/data',
        master: true,
        unitId: unit.unitId
      }]
    });
    
    // Create an API key
    const apiKey = await client.createRepoKey({
      repoId: repo.repoId,
      name: 'Production Key',
      accessType: AccessType.WRITE
    });
    
    // Get statistics
    const stats = await client.getDailyStats({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      endDate: new Date(),
      repoId: [repo.repoId]
    });
    
    // Check current subscription
    const mySubscription = await client.getMySubscription();
    if (mySubscription.data) {
      console.log('Current subscription:', mySubscription.data.name);
      
      // Get payment history
      const payments = await client.getPayments({
        startDate: '2024-01-01T00:00:00Z',
        endDate: new Date().toISOString()
      });
      
      if (payments.success && payments.data) {
        console.log(`Payment history: ${payments.data.length} payments found`);
        payments.data.forEach(payment => {
          console.log(`  ${payment.timestamp}: $${payment.amount} ${payment.currency} (${payment.status})`);
        });
      }
    }
    
    console.log('Setup complete!');
    console.log('Unit ID:', unit.unitId);
    console.log('Repository ID:', repo.repoId);
    console.log('API Key:', apiKey.key);
    console.log('Weekly stats:', stats.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

example();
``` 