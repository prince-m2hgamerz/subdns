import "server-only";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "SubDNS",
  siteDescription: "Subdomain Management Platform",
  registrationOpen: "true",
  defaultSubdomainLimit: "10",
  maxSubdomainLength: "63",
};

async function ensureFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  await ensureFile();
  const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function updateSetting(key: string, value: string): Promise<Record<string, string>> {
  const settings = await getSettings();
  settings[key] = value;
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  return settings;
}

export async function deleteSetting(key: string): Promise<Record<string, string>> {
  const settings = await getSettings();
  delete settings[key];
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  return settings;
}
