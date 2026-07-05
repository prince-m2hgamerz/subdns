import { getApiKey, getBaseUrl } from "./config.js";
async function request(method, path, body) {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Not logged in. Run `subdns login` first.");
        process.exit(1);
    }
    const url = `${getBaseUrl()}${path}`;
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
        const msg = data.error ?? `HTTP ${res.status}`;
        console.error(`Error: ${msg}`);
        process.exit(1);
    }
    return data;
}
export function get(path) {
    return request("GET", path);
}
export function post(path, body) {
    return request("POST", path, body);
}
export function del(path) {
    return request("DELETE", path);
}
//# sourceMappingURL=api.js.map