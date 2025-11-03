export interface GetSettingsResponse {
    success: boolean;
    // Using Record<string, any> for maximum flexibility - settings can contain any JSON-serializable data
    settings: Record<string, any>;
  };

  // POST /settings/user and /settings/organization requests
  export interface UpdateSettingsRequest {
    // Using Record<string, any> for maximum flexibility - settings can contain any JSON-serializable data
    settings: Record<string, any>;
  };

  // PUT /settings/user and /settings/organization requests (partial update)
  export interface PartialUpdateSettingsRequest {
    // Using [key: string]: any for maximum flexibility - partial updates can contain any JSON-serializable data
    [key: string]: any;
  };

  // DELETE /settings/user and /settings/organization requests
  export interface DeleteSettingsRequest {
    keys: string[];
  };

  // Generic error response
  export interface SettingsErrorResponse {
    success: false;
    message: string;
    error?: string;
  };