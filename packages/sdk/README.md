# @subdns/sdk

Official TypeScript SDK for the [SubDNS API](https://subdns.m2hio.in).

## Install

```bash
npm install @subdns/sdk
```

## Usage

```ts
import { SubdnsClient } from "@subdns/sdk";

const api = new SubdnsClient({ apiKey: "sk_..." });

// Subdomains
const subs = await api.listSubdomains();
const sub = await api.createSubdomain({ name: "my-project", domain: "subdns.m2hio.in" });
await api.updateSubdomain(sub.id, { proxied: true });
await api.deleteSubdomain(sub.id);

// DNS Records
const record = await api.createDnsRecord({
  subdomainId: sub.id,
  type: "A",
  name: "@",
  value: "1.2.3.4",
  ttl: 300,
});
const prop = await api.checkDnsPropagation(record.id);

// Domains
const { domains, defaultDomain } = await api.listDomains();

// API Keys
const { key } = await api.createApiKey({ name: "ci-cd" });
await api.deleteApiKey(keyId);

// Webhooks
const hook = await api.createWebhook({ url: "https://...", events: ["subdomain.created"] });
const deliveries = await api.listWebhookDeliveries(hook.id);

// User
const plan = await api.getPlan();
const profile = await api.updateProfile({ name: "Me" });
await api.submitKyc({ fullName: "...", dateOfBirth: "...", address: "...", phone: "...", purpose: "..." });
await api.acceptAgreement("terms_of_service");
const activity = await api.listActivity();
```

## API

### `new SubdnsClient(options)`

| Option | Default | Description |
|--------|---------|-------------|
| `apiKey` | — | Your SubDNS API key |
| `baseUrl` | `https://subdns.m2hio.in` | API base URL |
| `fetch` | `globalThis.fetch` | Custom fetch function |

### Methods

| Method | Returns |
|--------|---------|
| `listSubdomains()` | `Subdomain[]` |
| `getSubdomain(id)` | `Subdomain` |
| `createSubdomain(params)` | `Subdomain` |
| `updateSubdomain(id, params)` | `Subdomain` |
| `deleteSubdomain(id)` | `void` |
| `bulkDeleteSubdomains(ids)` | `{ deleted: number }` |
| `createDnsRecord(params)` | `DnsRecord` |
| `updateDnsRecord(id, params)` | `DnsRecord` |
| `deleteDnsRecord(id)` | `void` |
| `bulkDeleteDnsRecords(ids)` | `{ deleted: number }` |
| `checkDnsPropagation(id, domain?)` | `{ propagated, status }` |
| `listDomains()` | `{ domains, defaultDomain }` |
| `listApiKeys()` | `{ keys }` |
| `createApiKey(params)` | `{ key }` |
| `updateApiKey(id, params)` | `ApiKey` |
| `deleteApiKey(id)` | `void` |
| `listWebhooks()` | `Webhook[]` |
| `createWebhook(params)` | `Webhook` |
| `updateWebhook(id, params)` | `Webhook` |
| `deleteWebhook(id)` | `void` |
| `testWebhook(id)` | `{ status }` |
| `listWebhookDeliveries(webhookId?)` | `WebhookDelivery[]` |
| `updateProfile(profile)` | `UserProfile` |
| `getPlan()` | `UserPlan` |
| `getNotificationPreferences()` | `NotificationPreferences` |
| `updateNotificationPreferences(prefs)` | `NotificationPreferences` |
| `getKyc()` | `KycInfo` |
| `submitKyc(params)` | `KycInfo` |
| `listAgreements()` | `Agreement[]` |
| `acceptAgreement(type)` | `Agreement` |
| `deleteAccount()` | `void` |
| `listActivity(page?, limit?)` | `{ activities, pagination }` |

### Errors

| Class | HTTP Status |
|-------|-------------|
| `SubdnsError` | any |
| `AuthenticationError` | 401 |
| `RateLimitError` | 429 |
| `NotFoundError` | 404 |
| `ValidationError` | 400 |

```ts
import { SubdnsError, RateLimitError } from "@subdns/sdk";

try {
  await api.listSubdomains();
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log("slow down", err.resetAt);
  }
}
```

## License

MIT
