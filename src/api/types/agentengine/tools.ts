import type { ToolDefinition } from './flow';

export interface ListAgentToolsResponse {
  tools: ToolDefinition[];
  count: number;
}

export interface RefreshAgentToolsResponse {
  message: string;
  count: number;
}
