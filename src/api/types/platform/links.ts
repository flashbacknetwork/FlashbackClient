// Creator information
export interface CreatorInfo {
  email: string;
  name: string;
  lastName: string;
}

// Activation Link DTO
export interface ActivationLinkDTO {
  id: string;
  createdAt: Date | string;
  description: string;
  email: string;
  activatedAt: Date | string | null;
  createdBy: string;
  creator: CreatorInfo;
  activationLink: string;
}

// GET /links - Query parameters
export interface GetLinksRequest {
  from?: string;
  to?: string;
  take?: number;
  skip?: number;
  status?: 'activated' | 'pending' | 'all';
  text?: string;
}

// GET /links - Response
export interface GetLinksResponse {
  success: boolean;
  links: ActivationLinkDTO[];
  total: number;
  skip: number;
  take: number;
  error_code?: string;
  message?: string;
}

// POST /links - Request body
export interface CreateLinkRequest {
  name: string;
  email: string;
}

// POST /links - Response
export interface CreateLinkResponse {
  success: boolean;
  calendarUrl: string;
  error_code?: string;
}

// PUT /links/:id - Request body
export interface UpdateLinkRequest {
  description?: string;
  email?: string;
}

// PUT /links/:id - Response
export interface UpdateLinkResponse {
  success: boolean;
  link: ActivationLinkDTO;
  error_code?: string;
  message?: string;
}

// DELETE /links/:id - Response
export interface DeleteLinkResponse {
  success: boolean;
  message: string;
  error_code?: string;
}

// GET /links/:linkId - Query parameters
export interface GetLinkByTokenRequest {
  token: string;
}

// GET /links/:linkId - Response
export interface GetLinkByTokenResponse {
  success: boolean;
  uuid: string;
  email: string;
  activatedAt: Date | string | null;
  error_code?: string;
  message?: string;
}

