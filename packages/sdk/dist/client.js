import { SubdnsError } from "./errors.js";
function buildQuery(params) {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
    if (entries.length === 0)
        return "";
    return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
export class SubdnsClient {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseUrl = (options.baseUrl ?? "https://subdns.m2hio.in").replace(/\/+$/, "");
        this.fetch = options.fetch ?? globalThis.fetch;
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
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
            let errorBody;
            try {
                errorBody = await res.json();
            }
            catch {
                // ignore parse failures
            }
            const message = errorBody?.error ?? res.statusText;
            throw new SubdnsError(message, res.status, errorBody);
        }
        if (res.status === 204)
            return undefined;
        return res.json();
    }
    // ---------------------------------------------------------------------------
    // Subdomains
    // ---------------------------------------------------------------------------
    listSubdomains() {
        return this.request("GET", "/v1/subdomains");
    }
    getSubdomain(id) {
        return this.request("GET", `/v1/subdomains/${id}`);
    }
    createSubdomain(params) {
        return this.request("POST", "/v1/subdomains", params);
    }
    updateSubdomain(id, params) {
        return this.request("PATCH", `/v1/subdomains/${id}`, params);
    }
    deleteSubdomain(id) {
        return this.request("DELETE", `/v1/subdomains/${id}`);
    }
    bulkDeleteSubdomains(ids) {
        return this.request("POST", "/v1/subdomains/bulk-delete", { ids });
    }
    // ---------------------------------------------------------------------------
    // DNS Records
    // ---------------------------------------------------------------------------
    createDnsRecord(params) {
        return this.request("POST", "/v1/dns", params);
    }
    updateDnsRecord(id, params) {
        return this.request("PATCH", `/v1/dns/${id}`, params);
    }
    deleteDnsRecord(id) {
        return this.request("DELETE", `/v1/dns/${id}`);
    }
    bulkDeleteDnsRecords(ids) {
        return this.request("POST", "/v1/dns/bulk-delete", { ids });
    }
    checkDnsPropagation(id, domain) {
        const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
        return this.request("GET", `/v1/dns/${id}/propagation${qs}`);
    }
    // ---------------------------------------------------------------------------
    // Domains
    // ---------------------------------------------------------------------------
    listDomains() {
        return this.request("GET", "/v1/domains");
    }
    // ---------------------------------------------------------------------------
    // API Keys
    // ---------------------------------------------------------------------------
    listApiKeys() {
        return this.request("GET", "/v1/api-keys");
    }
    createApiKey(params) {
        return this.request("POST", "/v1/api-keys", params);
    }
    updateApiKey(id, params) {
        return this.request("PUT", `/v1/api-keys/${id}`, params);
    }
    deleteApiKey(id) {
        return this.request("DELETE", `/v1/api-keys/${id}`);
    }
    // ---------------------------------------------------------------------------
    // Webhooks
    // ---------------------------------------------------------------------------
    listWebhooks() {
        return this.request("GET", "/v1/webhooks");
    }
    createWebhook(params) {
        return this.request("POST", "/v1/webhooks", params);
    }
    updateWebhook(id, params) {
        return this.request("PATCH", `/v1/webhooks/${id}`, params);
    }
    deleteWebhook(id) {
        return this.request("DELETE", `/v1/webhooks/${id}`);
    }
    testWebhook(id) {
        return this.request("POST", `/v1/webhooks/${id}/test`);
    }
    listWebhookDeliveries(webhookId) {
        const qs = webhookId ? `?webhook_id=${encodeURIComponent(webhookId)}` : "";
        return this.request("GET", `/v1/webhooks/deliveries${qs}`);
    }
    // ---------------------------------------------------------------------------
    // User
    // ---------------------------------------------------------------------------
    updateProfile(profile) {
        return this.request("PATCH", "/v1/user/profile", profile);
    }
    getPlan() {
        return this.request("GET", "/v1/user/plan");
    }
    getNotificationPreferences() {
        return this.request("GET", "/v1/user/notification-preferences");
    }
    updateNotificationPreferences(prefs) {
        return this.request("PUT", "/v1/user/notification-preferences", prefs);
    }
    getKyc() {
        return this.request("GET", "/v1/user/kyc");
    }
    submitKyc(params) {
        return this.request("POST", "/v1/user/kyc", params);
    }
    listAgreements() {
        return this.request("GET", "/v1/user/agreements");
    }
    acceptAgreement(type) {
        return this.request("POST", "/v1/user/agreements", { agreementType: type });
    }
    deleteAccount() {
        return this.request("DELETE", "/v1/user/account");
    }
    // ---------------------------------------------------------------------------
    // Activity
    // ---------------------------------------------------------------------------
    listActivity(page = 1, limit = 20) {
        return this.request("GET", `/v1/activity${buildQuery({ page, limit })}`);
    }
}
//# sourceMappingURL=client.js.map