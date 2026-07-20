import {LlmAgent, FunctionTool, Context} from '@google/adk';
import {z} from 'zod';

const API_BASE = process.env.SUBDNS_API_BASE ?? 'http://localhost:3000';

function getAuthToken(ctx: Context | undefined): string | undefined {
  return ctx?.state.get<string>('apiKey');
}

async function apiFetch(
  ctx: Context | undefined,
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const token = getAuthToken(ctx);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {...options, headers});
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      `API ${res.status}: ${(body as {error?: string}).error ?? JSON.stringify(body)}`,
    );
  }
  return body;
}

const setApiKeyTool = new FunctionTool({
  name: 'set_api_key',
  description: 'Store your SubDNS API key in the session. Call this before making any other API calls.',
  parameters: z.object({
    key: z.string().describe('Your SubDNS API key (starts with sk_)'),
  }),
  execute: async (input, ctx) => {
    if (!ctx) return 'Session context unavailable';
    ctx.state.set('apiKey', input.key);
    return 'API key stored successfully';
  },
});

const listSubdomainsTool = new FunctionTool({
  name: 'list_subdomains',
  description: 'List all subdomains for the authenticated user with their DNS records',
  parameters: z.object({}),
  execute: async (_input, ctx) => {
    const data = await apiFetch(ctx, '/api/subdomains') as {subdomains: unknown};
    return data.subdomains;
  },
});

const createSubdomainTool = new FunctionTool({
  name: 'create_subdomain',
  description: 'Create a new subdomain under a root domain',
  parameters: z.object({
    name: z.string().describe('Subdomain name (letters, numbers, hyphens)'),
    target: z.string().optional().describe('Target for CNAME/A/AAAA record (not needed for DELEGATED mode)'),
    type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']).optional().default('CNAME').describe('DNS record type'),
    proxied: z.boolean().optional().default(false).describe('Whether the record is proxied through Cloudflare'),
    domain: z.string().describe('Root domain to create the subdomain under'),
    dnsMode: z.enum(['STANDARD', 'DELEGATED']).optional().default('STANDARD').describe('DNS management mode'),
    nameservers: z.array(z.string()).optional().describe('Required if dnsMode is DELEGATED'),
  }),
  execute: async (input, ctx) => {
    const data = await apiFetch(ctx, '/api/subdomains', {
      method: 'POST',
      body: JSON.stringify(input),
    }) as {subdomain: unknown};
    return data.subdomain;
  },
});

const createDnsRecordTool = new FunctionTool({
  name: 'create_dns_record',
  description: 'Add a DNS record to an existing subdomain',
  parameters: z.object({
    subdomainId: z.string().describe('The ID of the subdomain to add the record to'),
    type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA']).describe('DNS record type'),
    name: z.string().optional().describe('Record name (defaults to subdomain name)'),
    content: z.string().describe('Record value (IP, hostname, text, etc.)'),
    ttl: z.number().int().min(1).optional().default(1).describe('Time to live in seconds (1 = auto)'),
    priority: z.number().int().optional().describe('Priority for MX/SRV records'),
    proxied: z.boolean().optional().default(false).describe('Whether the record is proxied through Cloudflare'),
  }),
  execute: async (input, ctx) => {
    const data = await apiFetch(ctx, '/api/dns', {
      method: 'POST',
      body: JSON.stringify(input),
    }) as {record: unknown};
    return data.record;
  },
});

const updateDnsRecordTool = new FunctionTool({
  name: 'update_dns_record',
  description: 'Update an existing DNS record',
  parameters: z.object({
    id: z.string().describe('The ID of the DNS record to update'),
    content: z.string().optional().describe('New record value'),
    ttl: z.number().int().min(1).optional().describe('New TTL in seconds'),
    priority: z.number().int().optional().describe('New priority (MX/SRV)'),
    proxied: z.boolean().optional().describe('Whether the record is proxied'),
  }),
  execute: async (input, ctx) => {
    const {id, ...body} = input;
    const data = await apiFetch(ctx, `/api/dns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }) as {record: unknown};
    return data.record;
  },
});

const deleteDnsRecordTool = new FunctionTool({
  name: 'delete_dns_record',
  description: 'Delete a DNS record',
  parameters: z.object({
    id: z.string().describe('The ID of the DNS record to delete'),
  }),
  execute: async (input, ctx) => {
    return apiFetch(ctx, `/api/dns/${input.id}`, {method: 'DELETE'});
  },
});

const listDomainsTool = new FunctionTool({
  name: 'list_domains',
  description: 'List all available root domains for subdomain creation',
  parameters: z.object({}),
  execute: async (_input, ctx) => {
    const data = await apiFetch(ctx, '/api/domains') as {domains: unknown; defaultDomain: unknown};
    return data;
  },
});

const listActivityTool = new FunctionTool({
  name: 'list_activity',
  description: 'List recent account activity',
  parameters: z.object({
    page: z.number().int().min(1).optional().default(1).describe('Page number'),
    limit: z.number().int().min(1).max(100).optional().default(20).describe('Items per page'),
  }),
  execute: async (input, ctx) => {
    const data = await apiFetch(ctx, `/api/activity?page=${input.page}&limit=${input.limit}`);
    return data;
  },
});

const listApiKeysTool = new FunctionTool({
  name: 'list_api_keys',
  description: 'List all API keys for the authenticated user',
  parameters: z.object({}),
  execute: async (_input, ctx) => {
    const data = await apiFetch(ctx, '/api/api-keys') as {keys: unknown};
    return data.keys;
  },
});

const createApiKeyTool = new FunctionTool({
  name: 'create_api_key',
  description: 'Create a new API key',
  parameters: z.object({
    name: z.string().describe('A label for the API key'),
    scopes: z.array(z.string()).optional().describe('Permission scopes'),
    description: z.string().optional().describe('Optional description'),
    expiresAt: z.string().optional().describe('ISO 8601 expiration date'),
  }),
  execute: async (input, ctx) => {
    const data = await apiFetch(ctx, '/api/api-keys', {
      method: 'POST',
      body: JSON.stringify(input),
    }) as {key: unknown};
    return data.key;
  },
});

export const subdnsAgent = new LlmAgent({
  name: 'subdns-agent',
  model: process.env.SUBDNS_AGENT_MODEL ?? 'gemini-2.0-flash',
  instruction:
    'You are a helpful SubDNS assistant. You can manage subdomains, DNS records, ' +
    'and API keys for the user. Before making any API calls, ask the user for their ' +
    'SubDNS API key and store it in session state by calling set_api_key. ' +
    'When the user asks you to create something, ask for any missing required parameters. ' +
    'Use the tools available to you to perform the requested operations.',
  tools: [
    setApiKeyTool,
    listSubdomainsTool,
    createSubdomainTool,
    createDnsRecordTool,
    updateDnsRecordTool,
    deleteDnsRecordTool,
    listDomainsTool,
    listActivityTool,
    listApiKeysTool,
    createApiKeyTool,
  ],
});
