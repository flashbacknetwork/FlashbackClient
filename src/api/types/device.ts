export interface DeviceListResponse {
    success: boolean;
    devices: Array<{
      id: string;
      deviceName: string;
      deviceType: string;
      os: string;
      browser: string;
      ipAddress?: string;
      country?: string;
      city?: string;
      isTrusted: boolean;
      trustLevel: string;
      lastSeen: string;
      createdAt: string;
      trustExpiresAt?: string;
    }>;
  }
  
  export interface SessionListResponse {
    success: boolean;
    sessions: Array<{
      id: string;
      deviceName: string;
      ipAddress?: string;
      location?: string;
      startedAt: string;
      lastActivity: string;
      expiresAt: string;
      loginMethod: string;
    }>;
  }

  export interface DeviceDetailsResponse {
    success: boolean;
    device: {
      id: string;
      deviceName: string;
      deviceType: string;
      os: string;
      browser: string;
      ipAddress?: string;
      country?: string;
      city?: string;
      isTrusted: boolean;
      trustLevel: string;
      lastSeen: string;
      createdAt: string;
      trustExpiresAt?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      sessions: Array<{
        id: string;
        ipAddress?: string;
        location?: string;
        startedAt: string;
        lastActivity: string;
        expiresAt: string;
        loginMethod: string;
      }>;
    };
  }

  export interface TrustDeviceRequest {
    fingerprint: string;
  }

  export interface TrustDeviceResponse {
    success: boolean;
    message: string;
    trustExpiresAt: string;
  }

  export interface UntrustDeviceResponse {
    success: boolean;
    message: string;
  }

  export interface RemoveDeviceResponse {
    success: boolean;
    message: string;
  }

  export interface RevokeSessionResponse {
    success: boolean;
    message: string;
  }

  export interface RevokeAllSessionsResponse {
    success: boolean;
    message: string;
  }

  export interface SessionHeartbeatResponse {
    success: boolean;
    message: string;
    newExpiry: string;
  }

  export interface DeviceInfo {
    userAgent: string;
    ipAddress?: string;
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
    os: string;
    browser: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
  }
  
  export interface GeolocationInfo {
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  }
  
  export interface DeviceFingerprint {
    fingerprint: string;
    deviceInfo: DeviceInfo;
    geolocation: GeolocationInfo;
  }
