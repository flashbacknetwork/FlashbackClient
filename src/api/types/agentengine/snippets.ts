import type { JsonObject } from './common';

export interface Snippet {
  id: string;
  org_id: string;
  name: string;
  description: string;
  provider: string;
  resource_type: string;
  purpose: string;
  code: string;
  input_schema?: JsonObject;
  output_schema?: JsonObject;
  sandbox_image: string;
  reusable: boolean;
  version: number;
  last_used_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface SnippetVersion {
  id: string;
  snippet_id: string;
  version: number;
  code: string;
  created_at: string;
}

export interface UpdateAgentSnippetRequest {
  name?: string;
  description?: string;
  code?: string;
  input_schema?: JsonObject;
  output_schema?: JsonObject;
  sandbox_image?: string;
  reusable?: boolean;
}

export interface ListAgentSnippetsQuery {
  org_id: string;
  provider?: string;
  resource_type?: string;
  purpose?: string;
  reusable?: boolean;
}

export interface ListAgentSnippetsResponse {
  snippets: Snippet[];
  count: number;
}

export interface GetAgentSnippetResponse {
  snippet: Snippet;
}

export interface UpdateAgentSnippetResponse {
  snippet: Snippet;
  message: string;
}

export interface DeleteAgentSnippetResponse {
  message: string;
}

export interface ListAgentSnippetVersionsResponse {
  versions: SnippetVersion[];
  count: number;
}

export interface GetAgentSnippetVersionResponse {
  version: SnippetVersion;
}
