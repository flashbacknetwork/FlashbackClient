import { OrgRoles } from "./roles";

// Types for organization user management
export interface CreateOrgUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    orgRole?: number;
  }
  
  export interface UpdateOrgUserRequest {
    name?: string;
    lastName?: string;
    orgRole?: number;
  }
  
  export interface OrgUserResponse {
    id: string;
    email: string;
    name: string;
    lastName: string;
    orgId: string | null;
    orgRole: number | null;
    validated: boolean;
    deletedAt: Date | null;
    orgRoleDescription: string;
    orgRoles: OrgRoles[];
  }
  
  export interface ListOrgUsersResponse {
    success: boolean;
    data: OrgUserResponse[];
    total: number;
  }
  
  export interface CreateOrgUserResponse {
    success: boolean;
    data: OrgUserResponse;
    message: string;
  }
  
  export interface UpdateOrgUserResponse {
    success: boolean;
    data: OrgUserResponse;
    message: string;
  }
  
  export interface DeleteOrgUserResponse {
    success: boolean;
    message: string;
  }

  export interface OrganizationData {
    id: string;
    name: string;
    domain: string;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    zipcode?: string | null;
    phone?: string | null;
    state?: string | null;
    country?: string | null;
    deletedAt?: Date | null;
    reposDisabled: boolean;
    website?: string | null;
    is_business: boolean;
    mfaEnforced: boolean;
  }
  
  // GET /organization/:orgId - Get organization details
  export interface GetOrganizationParams {
    orgId: string;
  }
  
  export interface GetOrganizationResponse {
    success: boolean;
    data: OrganizationData | null;
    message?: string;
  }
  
  // PUT /organization/:orgId - Update organization details
  export interface UpdateOrganizationParams {
    orgId: string;
  }
  
  export interface UpdateOrganizationBody {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    zipcode?: string;
    phone?: string;
    state?: string;
    country?: string;
    is_business?: boolean;
    mfaEnforced?: boolean;
  }
  
  export interface UpdateOrganizationResponse {
    success: boolean;
    data: OrganizationData | null;
    message: string;
  }
  