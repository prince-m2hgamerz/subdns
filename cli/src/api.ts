import { getApiKey, getBaseUrl } from "./config.js";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  timeoutMs?: number
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError("Not logged in. Run `subdns login` first.", 401);
  }

  const url = `${getBaseUrl()}${path}`;
  const controller = new AbortController();
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw new ApiError(`Network error: ${(err as Error).message}`, 0);
  } finally {
    if (timer) clearTimeout(timer);
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(`Invalid JSON response (HTTP ${res.status})`, res.status);
  }

  if (!res.ok) {
    const msg =
      (data as { error?: string }).error ??
      (data as { message?: string }).message ??
      `HTTP ${res.status}`;
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

export function get<T>(path: string, timeoutMs?: number): Promise<T> {
  return request<T>("GET", path, undefined, timeoutMs);
}

export function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return request<T>("POST", path, body);
}

export function del<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}
