import Conf from "conf";

const store = new Conf({ projectName: "subdns" });

export function getApiKey(): string | undefined {
  return store.get("apiKey") as string | undefined;
}

export function setApiKey(key: string): void {
  store.set("apiKey", key);
}

export function clearApiKey(): void {
  store.delete("apiKey");
}

export function getBaseUrl(): string {
  return process.env.SUBDNS_API_URL ?? (store.get("baseUrl") as string) ?? "https://subdns.m2hio.in";
}

export function setBaseUrl(url: string): void {
  store.set("baseUrl", url);
}

export function getAllConfig(): Record<string, unknown> {
  return store.store as Record<string, unknown>;
}

export function getConfig(key: string): unknown {
  return store.get(key);
}
