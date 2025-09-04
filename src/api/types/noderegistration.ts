/**
 * Node Registration DTOs
 * Data Transfer Objects for organization keys
 */

// Node Key structure
export interface NodeKey {
  keyId: string;
  nodeId: string;
}

// Organization Key structure
export interface OrganizationKey {
  id: string;
  orgId: string;
  publicKey: string;
  createdAt: Date;
  nodeKeys: NodeKey[];
}

// Get Organization Keys Response
export interface GetOrganizationKeysResponse {
  success: boolean;
  data?: OrganizationKey[];
  message: string;
}
