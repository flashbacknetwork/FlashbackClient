import { ProviderType } from "../interfaces";

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
