import { ProviderType } from '../interfaces';

export interface AuthState {
  user: {
    email: string;
    name: string;
    imageUrl: string;
  } | null;
  token: string | null;
  accessToken: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  provider?: ProviderType;
}

export interface OAuth2ResponseDTO {
  success: boolean;
  authState: AuthState;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RefreshTokenErrorResponse {
  success: boolean;
  error_code?: string;
  message?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  orgId?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyWebsite?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  website?: string;
  isBusiness: boolean;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LogoutBody {
  refreshToken: string;
}

export interface RegisterResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenId?: string;
  expiresAt?: number;
  user?: {
    id: string;
    email: string;
    name: string;
    orgId?: string;
  };
  error_code?: string;
  message?: string;
}

export interface LoginResponse extends RegisterResponse {}

export interface LogoutResponse {
  success: boolean;
  error_code?: string;
  message?: string;
}

export interface ActivateResponse {
  success: boolean;
  error_code?: string;
  message?: string;
}

export interface DeactivateResponse {
  success: boolean;
  error_code?: string;
  message?: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}