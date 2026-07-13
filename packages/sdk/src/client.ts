import type {
  Subdomain,
  DnsRecord,
  CreateSubdomainParams,
  UpdateSubdomainParams,
  CreateDnsRecordParams,
  UpdateDnsRecordParams,
  ApiKey,
  CreateApiKeyParams,
  UpdateApiKeyParams,
  Webhook,
  CreateWebhookParams,
  UpdateWebhookParams,
  WebhookDelivery,
  UserProfile,
  UserPlan,
  NotificationPreferences,
  KycInfo,
  SubmitKycParams,
  Agreement,
  AgreementType,
  ActivityLogEntry,
  Domain,
  ListDomainsResponse,
} from "./types.js";
import { SubdnsError, NotFoundError } from "./errors.js";

type FetchFn = typeof fetch;

export interface SubdnsClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: FetchFn;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

export class SubdnsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetch: FetchFn;

  constructor(options: SubdnsClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://subdns.m2hio.in").replace(/\/+$/, "");
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const res = await this.fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let errorBody: { error?: string } | undefined;
      try {
        errorBody = await res.json();
      } catch {
        // ignore parse failures
      }
      const message = errorBody?.error ?? res.statusText;
      throw new SubdnsError(message, res.status, errorBody);
    }

    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  // ---------------------------------------------------------------------------
  // Subdomains
  // ---------------------------------------------------------------------------

  listSubdomains(): Promise<Subdomain[]> {
    return this.request<Subdomain[]>("GET", "/v1/subdomains");
  }

  getSubdomain(id: string): Promise<Subdomain> {
    return this.request<Subdomain>("GET", `/v1/subdomains/${id}`);
  }

  createSubdomain(params: CreateSubdomainParams): Promise<Subdomain> {
    return this.request<Subdomain>("POST", "/v1/subdomains", params);
  }

  updateSubdomain(id: string, params: UpdateSubdomainParams): Promise<Subdomain> {
    return this.request<Subdomain>("PATCH", `/v1/subdomains/${id}`, params);
  }

  deleteSubdomain(id: string): Promise<void> {
    return this.request<void>("DELETE", `/v1/subdomains/${id}`);
  }

  bulkDeleteSubdomains(ids: string[]): Promise<{ deleted: number }> {
    return this.request<{ deleted: number }>("POST", "/v1/subdomains/bulk-delete", { ids });
  }

  // ---------------------------------------------------------------------------
  // DNS Records
  // ---------------------------------------------------------------------------

  createDnsRecord(params: CreateDnsRecordParams): Promise<DnsRecord> {
    return this.request<DnsRecord>("POST", "/v1/dns", params);
  }

  updateDnsRecord(id: string, params: UpdateDnsRecordParams): Promise<DnsRecord> {
    return this.request<DnsRecord>("PATCH", `/v1/dns/${id}`, params);
  }

  deleteDnsRecord(id: string): Promise<void> {
    return this.request<void>("DELETE", `/v1/dns/${id}`);
  }

  bulkDeleteDnsRecords(ids: string[]): Promise<{ deleted: number }> {
    return this.request<{ deleted: number }>("POST", "/v1/dns/bulk-delete", { ids });
  }

  checkDnsPropagation(id: string, domain?: string): Promise<{ propagated: boolean; status: string }> {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    return this.request<{ propagated: boolean; status: string }>("GET", `/v1/dns/${id}/propagation${qs}`);
  }

  // ---------------------------------------------------------------------------
  // Domains
  // ---------------------------------------------------------------------------

  listDomains(): Promise<ListDomainsResponse> {
    return this.request<ListDomainsResponse>("GET", "/v1/domains");
  }

  // ---------------------------------------------------------------------------
  // API Keys
  // ---------------------------------------------------------------------------

  listApiKeys(): Promise<{ keys: ApiKey[] }> {
    return this.request<{ keys: ApiKey[] }>("GET", "/v1/api-keys");
  }

  createApiKey(params: CreateApiKeyParams): Promise<{ key: string }> {
    return this.request<{ key: string }>("POST", "/v1/api-keys", params);
  }

  updateApiKey(id: string, params: UpdateApiKeyParams): Promise<ApiKey> {
    return this.request<ApiKey>("PUT", `/v1/api-keys/${id}`, params);
  }

  deleteApiKey(id: string): Promise<void> {
    return this.request<void>("DELETE", `/v1/api-keys/${id}`);
  }

  // ---------------------------------------------------------------------------
  // Webhooks
  // ---------------------------------------------------------------------------

  listWebhooks(): Promise<Webhook[]> {
    return this.request<Webhook[]>("GET", "/v1/webhooks");
  }

  createWebhook(params: CreateWebhookParams): Promise<Webhook> {
    return this.request<Webhook>("POST", "/v1/webhooks", params);
  }

  updateWebhook(id: string, params: UpdateWebhookParams): Promise<Webhook> {
    return this.request<Webhook>("PATCH", `/v1/webhooks/${id}`, params);
  }

  deleteWebhook(id: string): Promise<void> {
    return this.request<void>("DELETE", `/v1/webhooks/${id}`);
  }

  testWebhook(id: string): Promise<{ status: number }> {
    return this.request<{ status: number }>("POST", `/v1/webhooks/${id}/test`);
  }

  listWebhookDeliveries(webhookId?: string): Promise<WebhookDelivery[]> {
    const qs = webhookId ? `?webhook_id=${encodeURIComponent(webhookId)}` : "";
    return this.request<WebhookDelivery[]>("GET", `/v1/webhooks/deliveries${qs}`);
  }

  // ---------------------------------------------------------------------------
  // User
  // ---------------------------------------------------------------------------

  updateProfile(profile: UserProfile): Promise<UserProfile> {
    return this.request<UserProfile>("PATCH", "/v1/user/profile", profile);
  }

  getPlan(): Promise<UserPlan> {
    return this.request<UserPlan>("GET", "/v1/user/plan");
  }

  getNotificationPreferences(): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>("GET", "/v1/user/notification-preferences");
  }

  updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>("PUT", "/v1/user/notification-preferences", prefs);
  }

  getKyc(): Promise<KycInfo> {
    return this.request<KycInfo>("GET", "/v1/user/kyc");
  }

  submitKyc(params: SubmitKycParams): Promise<KycInfo> {
    return this.request<KycInfo>("POST", "/v1/user/kyc", params);
  }

  listAgreements(): Promise<Agreement[]> {
    return this.request<Agreement[]>("GET", "/v1/user/agreements");
  }

  acceptAgreement(type: AgreementType): Promise<Agreement> {
    return this.request<Agreement>("POST", "/v1/user/agreements", { agreementType: type });
  }

  deleteAccount(): Promise<void> {
    return this.request<void>("DELETE", "/v1/user/account");
  }

  // ---------------------------------------------------------------------------
  // Activity
  // ---------------------------------------------------------------------------

  listActivity(page = 1, limit = 20): Promise<{ activities: ActivityLogEntry[]; pagination: { total: number; page: number; perPage: number; totalPages: number } }> {
    return this.request("GET", `/v1/activity${buildQuery({ page, limit })}`);
  }
}
