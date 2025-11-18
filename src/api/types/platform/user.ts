export interface UserUpdateRequest {
    name?: string;
    lastName?: string;
    password?: string;
}

export interface UserUpdateResponse {
    success: boolean;
    message: string;
}

export interface PreVerifyEmailResponse {
    success: boolean;
    message: string;
    authMethod: string;
    hasPassword: boolean;
}