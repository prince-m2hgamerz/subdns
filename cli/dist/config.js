import Conf from "conf";
const store = new Conf({ projectName: "subdns" });
export function getApiKey() {
    return store.get("apiKey");
}
export function setApiKey(key) {
    store.set("apiKey", key);
}
export function clearApiKey() {
    store.delete("apiKey");
}
export function getBaseUrl() {
    return process.env.SUBDNS_API_URL ?? store.get("baseUrl") ?? "https://subdns.m2hio.in";
}
//# sourceMappingURL=config.js.map