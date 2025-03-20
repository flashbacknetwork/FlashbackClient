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
    provider?: 'google' | 'github';
  }

export interface OAuth2ResponseDTO {
  success: boolean;
  authState: AuthState;
}
