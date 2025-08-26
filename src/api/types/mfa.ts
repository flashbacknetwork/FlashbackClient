import { DeviceInfo } from "./device";

// ============================================================================
// SELF-CONTAINED ENUM DEFINITIONS (Mirror Prisma but independent)
// ============================================================================

export enum MFAType {
    GOOGLE_AUTH = 'GOOGLE_AUTH',
    MAGIC_LINK = 'MAGIC_LINK',
    PASSKEY = 'PASSKEY'
  }
  
  export enum MFAAttemptType {
    VERIFICATION = 'VERIFICATION',
    SETUP = 'SETUP',
    DISABLE = 'DISABLE'
  }
  
  // ============================================================================
  // WEBATHN-COMPATIBLE TYPE DEFINITIONS (Self-contained)
  // ============================================================================
  
  // These types mirror WebAuthn types but are independent of external libraries
  export interface PasskeyCredential {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
      userHandle?: string;
    };
    type: 'public-key';
  }
  
  export interface PasskeyRegistrationCredential {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      attestationObject: string;
      clientExtensionResults?: Record<string, unknown>; // Add this to match WebAuthn
    };
    type: 'public-key';
  }
  
  export interface PasskeyAuthenticationCredential {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
      userHandle?: string;
    };
    type: 'public-key';
  }
  
  export interface PasskeyChallengeOptions {
    challenge: string;
    rpId: string;
    userVerification?: 'required' | 'preferred' | 'discouraged';
    timeout?: number;
  }
  
  export interface PasskeyRegistrationOptions extends PasskeyChallengeOptions {
    rp: {
      name: string;
      id: string;
    };
    user: {
      id: string;
      name: string;
      displayName: string;
    };
    pubKeyCredParams: Array<{
      type: 'public-key';
      alg: number;
    }>;
    authenticatorSelection?: {
      authenticatorAttachment?: 'platform' | 'cross-platform';
      residentKey?: 'required' | 'preferred' | 'discouraged';
      userVerification?: 'required' | 'preferred' | 'discouraged';
    };
    attestation?: 'none' | 'indirect' | 'direct';
  }
  
  // ============================================================================
  // REQUEST DTOs
  // ============================================================================
  
  export interface MFASetupRequest {
    mfaType: MFAType;
    email?: string; // For magic links
    deviceInfo?: DeviceInfo; // For passkeys
  }
  
  export interface MFAVerificationRequest {
    mfaType: MFAType;
    code?: string; // For TOTP
    token?: string; // For magic links
    credential?: PasskeyAuthenticationCredential; // For passkeys
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
  
  export interface MFAVerificationSetupRequest {
    mfaType: MFAType;
    code?: string; // For TOTP verification
    credential?: PasskeyRegistrationCredential; // For passkey verification
  }
  
  export interface MFAEnableRequest {
    mfaType: MFAType;
  }
  
  export interface MFAPrimaryRequest {
    mfaType: MFAType;
  }
  
  export interface MFAResetRequest {
    // Self-service MFA reset - no additional parameters needed
    _placeholder?: never;
  }
  
  export interface MFAOrganizationEnforceRequest {
    enforced: boolean;
  }
  
  export interface PasskeyCompleteRegistrationRequest {
    credential: PasskeyRegistrationCredential;
    challenge: string;
  }
  
  // ============================================================================
  // RESPONSE DTOs
  // ============================================================================
  
  export interface MFAVerificationResult {
    success: boolean;
    mfaMethod: MFAType;
    metadata?: Record<string, unknown>;
    error?: string;
  }
  
  export interface MFASetupResult {
    success: boolean;
    setupData?: Record<string, unknown>;
    error?: string;
  }
  
  export interface MFAStatus {
    isEnabled: boolean;
    isRequired: boolean;
    isEnforced: boolean;
    enabledMethods: MFAType[];
    primaryMethod?: MFAType;
  }
  
  export interface MFAVerificationSetupResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export interface MFAEnableResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export interface MFADisableResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export interface MFAPrimaryResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export interface MFAResetResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export interface MFAOrganizationEnforceResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  // ============================================================================
  // MFA METHOD SPECIFIC DTOs
  // ============================================================================
  
  export interface GoogleAuthSetupData {
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }
  
  export interface MagicLinkSetupData {
    email: string;
    verificationRequired: boolean;
  }
  
  export interface PasskeySetupData {
    challenge: PasskeyRegistrationOptions;
    rpName: string;
    userName: string;
  }
  
  export interface PasskeyAuthOptionsResult {
    success: boolean;
    data?: PasskeyChallengeOptions;
    error?: string;
  }
  
  export interface PasskeyCompleteRegistrationResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  // ============================================================================
  // CORE TYPES
  // ============================================================================
  
  export interface MFAConfig {
    maxAttempts: number;
    lockoutDuration: number; // in minutes
    backupCodeCount: number;
    totpWindow: number; // TOTP validation window
    magicLinkExpiry: number; // in minutes
  }
  
  export const DEFAULT_MFA_CONFIG: MFAConfig = {
    maxAttempts: 5,
    lockoutDuration: 15,
    backupCodeCount: 10,
    totpWindow: 2, // Allow 2 time steps before/after current time
    magicLinkExpiry: 10,
  };
  
  export interface MFAChallenge {
    challengeId: string;
    userId: string;
    mfaType: MFAType;
    expiresAt: Date;
    metadata?: Record<string, unknown>;
  }
  
  export interface MFAVerificationChallenge {
    challengeId: string;
    userId: string;
    mfaType: MFAType;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    isLocked: boolean;
    lockoutUntil?: Date;
  }
  
  export interface MFAAttemptLog {
    userId: string;
    mfaType: MFAType;
    attemptType: MFAAttemptType;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }
  
  // ============================================================================
  // API RESPONSE WRAPPERS
  // ============================================================================
  
  export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  export type MFAStatusResponse = APIResponse<MFAStatus>;
  export type MFAMethodsResponse = APIResponse<MFAType[]>;
  export type MFASetupResponse = APIResponse<Record<string, unknown>>;
  export type MFAVerificationSetupResponse = APIResponse<MFAVerificationSetupResult>;
  export type MFAEnableResponse = APIResponse<MFAEnableResult>;
  export type MFADisableResponse = APIResponse<MFADisableResult>;
  export type MFAPrimaryResponse = APIResponse<MFAPrimaryResult>;
  export type MFAResetResponse = APIResponse<MFAResetResult>;
  export type MFAOrganizationEnforceResponse = APIResponse<MFAOrganizationEnforceResult>;
  export type PasskeyAuthOptionsResponse = APIResponse<PasskeyChallengeOptions>;
  export type PasskeyCompleteRegistrationResponse = APIResponse<PasskeyCompleteRegistrationResult>;
  export type MagicLinkSendResponse = APIResponse<{ message: string }>;
  
  // ============================================================================
  // UTILITY TYPES
  // ============================================================================
  
  export type MFAMethodType = 'GOOGLE_AUTH' | 'MAGIC_LINK' | 'PASSKEY';
  export type MFAAttemptTypeEnum = 'VERIFICATION' | 'SETUP' | 'DISABLE';
  