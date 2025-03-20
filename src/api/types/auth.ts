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
  