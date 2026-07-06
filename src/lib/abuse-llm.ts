export interface LLMVerdict {
  isAbusive: boolean;
  confidence: "low" | "medium" | "high";
  reason: string;
  categories: string[];
}

const LLM_PROMPT = `You are an abuse detection classifier for a subdomain provisioning service.
Analyze the following subdomain creation request and determine if it is likely abusive.

A subdomain is abusive if it:
1. Attempts phishing (mimics login pages, brand impersonation)
2. Uses homoglyphs or typosquatting to deceive
3. Is used for malware distribution, command-and-control, or scam hosting
4. Violates the platform's acceptable use policy (spam, illegal content)

Respond in JSON format only:
{
  "isAbusive": boolean,
  "confidence": "low" | "medium" | "high",
  "reason": "brief explanation",
  "categories": ["phishing", "typosquatting", "malware", "spam", "brand_impersonation", "none"]
}

Subdomain name: {{SUBDOMAIN}}
Target domain: {{TARGET}}
Account age (days): {{ACCOUNT_AGE}}
Heuristic signals: {{SIGNALS}}`;

interface LLMConfig {
  subdomain: string;
  targetDomain: string;
  accountAgeDays: number;
  heuristicSignals: string;
}

async function classifyWithNVIDIA(config: LLMConfig): Promise<LLMVerdict | null> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const prompt = LLM_PROMPT
    .replace("{{SUBDOMAIN}}", config.subdomain)
    .replace("{{TARGET}}", config.targetDomain)
    .replace("{{ACCOUNT_AGE}}", config.accountAgeDays.toFixed(1))
    .replace("{{SIGNALS}}", config.heuristicSignals);

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      isAbusive: parsed.isAbusive,
      confidence: parsed.confidence,
      reason: parsed.reason,
      categories: parsed.categories,
    };
  } catch {
    return null;
  }
}

export async function classifyAbuse(config: LLMConfig): Promise<LLMVerdict | null> {
  if (process.env.NVIDIA_API_KEY) {
    return classifyWithNVIDIA(config);
  }

  return null;
}
