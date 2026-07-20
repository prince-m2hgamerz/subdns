import type { Subdomain, DnsRecord, CreateSubdomainParams, UpdateSubdomainParams, CreateDnsRecordParams, UpdateDnsRecordParams, ApiKey, CreateApiKeyParams, UpdateApiKeyParams, Webhook, CreateWebhookParams, UpdateWebhookParams, WebhookDelivery, UserProfile, UserPlan, NotificationPreferences, KycInfo, SubmitKycParams, Agreement, AgreementType, ActivityLogEntry, ListDomainsResponse } from "./types.js";
type FetchFn = typeof fetch;
export interface SubdnsClientOptions {
    apiKey: string;
    baseUrl?: string;
    fetch?: FetchFn;
}
export declare class SubdnsClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly fetch;
    constructor(options: SubdnsClientOptions);
    private request;
    listSubdomains(): Promise<Subdomain[]>;
    getSubdomain(id: string): Promise<Subdomain>;
    createSubdomain(params: CreateSubdomainParams): Promise<Subdomain>;
    updateSubdomain(id: string, params: UpdateSubdomainParams): Promise<Subdomain>;
    deleteSubdomain(id: string): Promise<void>;
    bulkDeleteSubdomains(ids: string[]): Promise<{
        deleted: number;
    }>;
    createDnsRecord(params: CreateDnsRecordParams): Promise<DnsRecord>;
    updateDnsRecord(id: string, params: UpdateDnsRecordParams): Promise<DnsRecord>;
    deleteDnsRecord(id: string): Promise<void>;
    bulkDeleteDnsRecords(ids: string[]): Promise<{
        deleted: number;
    }>;
    checkDnsPropagation(id: string, domain?: string): Promise<{
        propagated: boolean;
        status: string;
    }>;
    listDomains(): Promise<ListDomainsResponse>;
    listApiKeys(): Promise<{
        keys: ApiKey[];
    }>;
    createApiKey(params: CreateApiKeyParams): Promise<{
        key: string;
    }>;
    updateApiKey(id: string, params: UpdateApiKeyParams): Promise<ApiKey>;
    deleteApiKey(id: string): Promise<void>;
    listWebhooks(): Promise<Webhook[]>;
    createWebhook(params: CreateWebhookParams): Promise<Webhook>;
    updateWebhook(id: string, params: UpdateWebhookParams): Promise<Webhook>;
    deleteWebhook(id: string): Promise<void>;
    testWebhook(id: string): Promise<{
        status: number;
    }>;
    listWebhookDeliveries(webhookId?: string): Promise<WebhookDelivery[]>;
    updateProfile(profile: UserProfile): Promise<UserProfile>;
    getPlan(): Promise<UserPlan>;
    getNotificationPreferences(): Promise<NotificationPreferences>;
    updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences>;
    getKyc(): Promise<KycInfo>;
    submitKyc(params: SubmitKycParams): Promise<KycInfo>;
    listAgreements(): Promise<Agreement[]>;
    acceptAgreement(type: AgreementType): Promise<Agreement>;
    deleteAccount(): Promise<void>;
    listActivity(page?: number, limit?: number): Promise<{
        activities: ActivityLogEntry[];
        pagination: {
            total: number;
            page: number;
            perPage: number;
            totalPages: number;
        };
    }>;
}
export {};
//# sourceMappingURL=client.d.ts.map