export interface Subdomain {
    id: string;
    name: string;
    domain: string;
    fullDomain: string;
    target: string | null;
    dnsMode: "STANDARD" | "DELEGATED";
    nameservers: string[] | null;
    status: "ACTIVE" | "SUSPENDED" | "PENDING";
    proxied: boolean;
    dnsStatus: string | null;
    isFavorite: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
    dnsRecords: DnsRecord[];
}
export interface DnsRecord {
    id: string;
    type: "A" | "AAAA" | "CNAME" | "NS" | "TXT" | "MX" | "SRV" | "CAA";
    name: string;
    value: string;
    ttl: number;
    proxied: boolean;
    priority: number | null;
    status: "ACTIVE" | "PENDING" | "FAILED";
    subdomainId: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateSubdomainParams {
    name: string;
    domain?: string;
    target?: string;
    dnsMode?: "STANDARD" | "DELEGATED";
    proxied?: boolean;
}
export interface UpdateSubdomainParams {
    target?: string;
    proxied?: boolean;
    dnsMode?: "STANDARD" | "DELEGATED";
    nameservers?: string[];
}
export interface CreateDnsRecordParams {
    subdomainId: string;
    type: DnsRecord["type"];
    name: string;
    value: string;
    ttl?: number;
    proxied?: boolean;
    priority?: number;
}
export interface UpdateDnsRecordParams {
    content?: string;
    ttl?: number;
    proxied?: boolean;
    priority?: number;
}
export interface ApiKey {
    id: string;
    name: string;
    key: string;
    scopes: string[];
    description: string;
    expiresAt: string | null;
    lastUsed: string | null;
    createdAt: string;
}
export interface CreateApiKeyParams {
    name: string;
    scopes?: string[];
    description?: string;
    expiresAt?: string;
}
export interface UpdateApiKeyParams {
    name?: string;
    description?: string;
}
export interface Webhook {
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    secret: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface CreateWebhookParams {
    url: string;
    events: string[];
    secret?: string;
}
export interface UpdateWebhookParams {
    url?: string;
    events?: string[];
    isActive?: boolean;
    secret?: string;
}
export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    requestBody: string;
    responseStatusCode: number | null;
    responseBody: string | null;
    durationMs: number | null;
    createdAt: string;
}
export interface UserProfile {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
}
export interface UserPlan {
    id: string;
    name: string;
    maxSubdomains: number;
    maxDnsRecords: number;
    maxApiKeys: number;
    maxWebhooks: number;
    features: string[];
}
export interface NotificationPreferences {
    email: boolean;
    browser: boolean;
    events: Record<string, boolean>;
}
export interface KycInfo {
    status: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    phone?: string;
    purpose?: string;
    verifiedAt?: string;
}
export interface SubmitKycParams {
    fullName: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    purpose: string;
}
export interface Agreement {
    id: string;
    agreementType: string;
    acceptedAt: string;
    ip: string;
}
export type AgreementType = "terms_of_service" | "privacy_policy" | "aup" | "dmca" | "refunds" | "cookies" | "disclaimer";
export interface ActivityLogEntry {
    id: string;
    type: string;
    description: string;
    ip: string | null;
    userAgent: string | null;
    metadata: unknown;
    userId: string | null;
    subdomainId: string | null;
    createdAt: string;
}
export interface Domain {
    id: string;
    name: string;
    isActive: boolean;
}
export interface ListDomainsResponse {
    domains: Domain[];
    defaultDomain: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
export interface ApiError {
    error: string;
    status: number;
}
//# sourceMappingURL=types.d.ts.map