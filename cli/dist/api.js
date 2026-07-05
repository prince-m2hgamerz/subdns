import { getApiKey, getBaseUrl } from "./config.js";
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
async function request(method, path, body, timeoutMs) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new ApiError("Not logged in. Run `subdns login` first.", 401);
    }
    const url = `${getBaseUrl()}${path}`;
    const controller = new AbortController();
    const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
    let res;
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
    }
    catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
            throw new ApiError("Request timed out", 408);
        }
        throw new ApiError(`Network error: ${err.message}`, 0);
    }
    finally {
        if (timer)
            clearTimeout(timer);
    }
    let data;
    try {
        data = await res.json();
    }
    catch {
        throw new ApiError(`Invalid JSON response (HTTP ${res.status})`, res.status);
    }
    if (!res.ok) {
        const msg = data.error ??
            data.message ??
            `HTTP ${res.status}`;
        throw new ApiError(msg, res.status);
    }
    return data;
}
export function get(path, timeoutMs) {
    return request("GET", path, undefined, timeoutMs);
}
export function post(path, body) {
    return request("POST", path, body);
}
export function del(path) {
    return request("DELETE", path);
}
//# sourceMappingURL=api.js.map