export enum OrgRoles {
    USER = 0x00,           // Default role - basic user
    BILLING = 0x01,        // Can manage billing and subscriptions
    WORKSPACES = 0x02,     // Can manage workspaces and team members
    ADMINISTRATORS = 0xfe, // Administrative access (leaves room for future roles)
    OWNER = 0xff           // Full organization access
  }
  

export interface UserRoleResponse {
    success: boolean;
    data?: {
      userId: string;
      orgRole: number;
      orgRoleDescription: string;
      orgRoles: OrgRoles[];
    };
    message?: string;
    error?: string;
  }
  
  export interface UpdateUserRoleRequest {
    orgRole: number;
  }
  
  export interface UpdateUserRoleResponse {
    success: boolean;
    data?: {
      userId: string;
      previousRole: number;
      newRole: number;
      message: string;
    };
    message?: string;
    error?: string;
  }
  
  export interface UserProfileResponse {
    success: boolean;
    data?: {
      id: string;
      name: string;
      lastName: string;
      email: string;
      orgId: string | null;
      orgRole: number | null;
      orgRoleDescription: string;
      orgRoles: OrgRoles[];
      validated: boolean;
      mfaRequired: boolean;
      isBusiness: boolean;
    };
    message?: string;
    error?: string;
  }
  