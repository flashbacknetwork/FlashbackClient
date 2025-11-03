export enum AccessType {
    READ = 'READ',
    WRITE = 'WRITE',
    ADMIN = 'ADMIN',
  }
  
  // Base workspace interface
  export interface Workspace {
    id: string;
    name: string;
    orgId: string;
    deletedAt?: Date | null;
    default?: boolean;
  }
  
  // Base workspace user interface
  export interface WorkspaceUser {
    userId: string;
    role: AccessType;
    user: {
      id: string;
      name: string;
      lastName: string;
      email: string;
      orgRole: number | null;
    };
  }
  
  // Create workspace request
  export interface CreateWorkspaceRequest {
    name: string;
  }
  
  // Create workspace response
  export interface CreateWorkspaceResponse {
    success: boolean;
    workspace: {
      id: string;
      name: string;
      orgId: string;
    };
  }
  
  // Get workspaces response
  export interface GetWorkspacesResponse {
    success: boolean;
    workspaces: Array<{
      id: string;
      name: string;
      orgId: string;
      users: WorkspaceUser[];
    }>;
  }
  
  // Get workspace response
  export interface GetWorkspaceResponse {
    success: boolean;
    workspace: {
      id: string;
      name: string;
      orgId: string;
      users: WorkspaceUser[];
    };
  }
  
  // Update workspace request
  export interface UpdateWorkspaceRequest {
    name?: string;
  }
  
  // Update workspace response
  export interface UpdateWorkspaceResponse {
    success: boolean;
    workspace: {
      id: string;
      name: string;
      orgId: string;
    };
  }
  
  // Delete workspace response
  export interface DeleteWorkspaceResponse {
    success: boolean;
  }
  
  // Add user to workspace request
  export interface AddUserToWorkspaceRequest {
    userId: string;
    role: AccessType;
  }
  
  // Add user to workspace response
  export interface AddUserToWorkspaceResponse {
    success: boolean;
  }
  
  // Update user role request
  export interface UpdateUserRoleRequest {
    role: AccessType;
  }
  
  // Update user role response
  export interface UpdateUserRoleResponse {
    success: boolean;
  }
  
  // Remove user from workspace response
  export interface RemoveUserFromWorkspaceResponse {
    success: boolean;
  }
  
  // Generic error response for workspace operations
  export interface WorkspaceErrorResponse {
    success: false;
    message: string;
  }
  