export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const TOOLS: ToolSchema[] = [
  {
    name: "get_user_info",
    description: "Get the current user's account info including plan, subdomain count, and DNS record count",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "list_subdomains",
    description: "List all subdomains for the current user",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["ACTIVE", "FLAGGED", "DISABLED"],
          description: "Filter by status (optional)",
        },
      },
    },
  },
  {
    name: "get_dns_records",
    description: "Get DNS records for a subdomain",
    parameters: {
      type: "object",
      properties: {
        subdomainId: { type: "string", description: "The subdomain ID" },
      },
      required: ["subdomainId"],
    },
  },
  {
    name: "get_subscription",
    description: "Get the current user's active subscription details",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "check_plan_access",
    description: "Check if the current user has access to a specific plan feature",
    parameters: {
      type: "object",
      properties: {
        requiredPlan: {
          type: "string",
          enum: ["BRONZE", "SILVER", "GOLD"],
          description: "The minimum plan required",
        },
      },
      required: ["requiredPlan"],
    },
  },
];

export const TOOLS_PROMPT_BLOCK = `You have access to tools that can look up live data about the user's account.
When the user asks about their account, subdomains, DNS records, subscription, or plan — select the appropriate tool and respond with a JSON object on its own line in this format:

{"tool": "tool_name", "args": { ... }}

Available tools:
${TOOLS.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

If no tool is needed, respond normally with just text.`;
