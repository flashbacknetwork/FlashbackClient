export enum RiskType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface CreatePolicyRequest {
  name: string;
  content: string;
  riskType: RiskType;
  actionType: number;
  orgId: string;
  workspaceId?: string | null;
  repoId?: string | null;
}

export interface UpdatePolicyRequest {
  name?: string;
  content?: string;
  riskType?: RiskType;
  actionType?: number;
}

export interface GetPoliciesQuery {
  orgId: string;
  workspaceId?: string | null;
  repoId?: string | null;
}

export interface PolicyDTO {
  id: string;
  orgId: string;
  name: string;
  content: string;
  riskType: RiskType;
  actionType: number;
  createdBy: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  lastUpdatedBy: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  lastUpdatedAt: Date;
  workspaceId: string | null;
  repoId: string | null;
  workspace?: {
    id: string;
    name: string;
  } | null;
  repo?: {
    id: string;
    name: string;
  } | null;
}

export interface GetPolicyViolationsQuery {
  workspaceId?: string;
  repoId?: string;
  policyId?: string;
  from?: string;
  to?: string;
  take?: number;
  skip?: number;
}

export interface PolicyViolationDTO {
  id: string;
  policyId: string;
  policyName: string;
  timestamp: Date;
  explanation: string;
  conversationId: string | null;
  repoId: string;
  repoName: string;
  userId: string;
  userName: string;
  repoAiApiKeyId: string;
  repoAiApiKeyName: string;
}

export interface GetPolicyViolationsResponse {
  success: boolean;
  violations: PolicyViolationDTO[];
  total: number;
  skip: number;
  take: number;
}

export interface GetPolicyAlertsQuery {
  workspaceId?: string;
  repoId?: string;
  policyId?: string;
  from?: string;
  to?: string;
  take?: number;
  skip?: number;
}

export interface PolicyAlertDTO {
  id: string;
  policyId: string;
  policyName: string;
  timestamp: Date;
  message: string;
  conversationId: string | null;
  repoId: string;
  repoName: string;
  userId: string;
  userName: string;
  repoAiApiKeyId: string;
  repoAiApiKeyName: string;
}

export interface GetPolicyAlertsResponse {
  success: boolean;
  alerts: PolicyAlertDTO[];
  total: number;
  skip: number;
  take: number;
}

// ============================================
// Policy Validation DTOs
// ============================================

export interface PolicyToValidate {
  policy_uuid: string;
  content: string;
}

export interface PolicyValidationRequest {
  policies: PolicyToValidate[];
}

export interface Issue {
  type: string;         // "ambiguity", "verbosity", "clarity", "scope", "actionability"
  description: string;
  suggestion: string;
}

export interface PolicyValidationResult {
  policy_uuid: string;
  score: number;        // 0-100, how good the policy is
  advice: string;       // Overall feedback and suggestions
  issues: Issue[];      // Specific issues found
  severity: "none" | "low" | "medium" | "high";
}

export interface PolicyValidationResponse {
  results: PolicyValidationResult[];
}

// ============================================
// Policy Recommendation DTOs
// ============================================

export interface PolicyRecommendationRequest {
  level: 0 | 1 | 2;     // 0=organization, 1=workspace, 2=repository
  uuid?: string;        // Optional: UUID of the org/workspace/repo
  prompt: string;       // Description of context, objectives, company needs, etc.
}

export interface PolicyRecommendation {
  content: string;                      // The recommended policy text
  riskType: "low" | "medium" | "high";  // Risk level based on company context
  alertType: "log" | "alert" | "block"; // Enforcement level based on company needs
}

export interface PolicyRecommendationResponse {
  level: 0 | 1 | 2;                    // Echoed from request
  uuid: string;                         // Echoed from request
  tokens_in: number;                    // Input tokens used
  tokens_out: number;                   // Output tokens used
  recommended_policies: PolicyRecommendation[];
}

