/**
 * Mirrors Go map[string]interface{} used across Agent Engine DTOs.
 */
export type JsonObject = Record<string, unknown>;

export interface AgentEngineErrorBody {
  message: string;
  code?: string;
}

export interface AgentEngineErrorEnvelope {
  error: AgentEngineErrorBody;
}
