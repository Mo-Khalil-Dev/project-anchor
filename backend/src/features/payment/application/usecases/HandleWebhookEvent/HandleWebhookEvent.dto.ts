export interface WebhookEvent {
  id: string;
  resource_type: string;
  action: string;
  links?: {
    mandate?: string;
    payment?: string;
    subscription?: string;
    billing_request?: string;
    [key: string]: string | undefined;
  };
  details?: Record<string, unknown>;
  created_at?: string;
}
