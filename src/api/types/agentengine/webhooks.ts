export interface AgentWebhook {
  id: string;
  org_id: string;
  template_id: string;
  name: string;
  token: string;
  active: boolean;
  parameters?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebhookWithUrl {
  webhook: AgentWebhook;
  trigger_url: string;
}

export interface CreateWebhookRequest {
  org_id: string;
  name: string;
  parameters?: Record<string, unknown>;
}

export interface CreateWebhookResponse extends WebhookWithUrl {}

export interface ListWebhooksResponse {
  webhooks: WebhookWithUrl[];
  count: number;
}
