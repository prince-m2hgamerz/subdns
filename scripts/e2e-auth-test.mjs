import { chromium } from "playwright";

const BASE = "https://subdns.m2hio.in";
const EMAIL = `e2e-form-${Date.now()}@example.com`;
const PASSWORD = "TestPass123!";
const NAME = "Form User";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on("console", msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", err => logs.push(`[PAGE_ERROR] ${err.message}`));
  page.on("response", resp => {
    if (resp.url().includes("/api/auth/")) {
      logs.push(`[API ${resp.status()}] ${resp.url().split("?")[0]}`);
    }
  });

  // Go to register page and submit form
  console.log("=== Form-based register test ===");
  await page.goto(`${BASE}/auth/register`, { waitUntil: "networkidle" });
  await new Promise(r => setTimeout(r, 2000));

  await page.fill('input[type="text"]', NAME);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  console.log("Form filled, clicking submit...");
  await page.click('button:has-text("Create Account")');
  await new Promise(r => setTimeout(r, 7000));

  console.log("URL after:", page.url());

  // Check cookies
  const cookies = await page.context().cookies();
  const session = cookies.find(c => c.name.includes("next") || c.name.includes("session"));
  console.log("Session cookie:", session ? "PRESENT" : "NONE");

  // Check dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  console.log("Dashboard:", page.url());

  // Test login flow
  console.log("\n=== Login test ===");
  await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
  await new Promise(r => setTimeout(r, 2000));

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button:has-text("Sign In")');
  await new Promise(r => setTimeout(r, 7000));
  console.log("URL after login:", page.url());
  const loginSession = (await page.context().cookies()).find(c => c.name.includes("next") || c.name.includes("session"));
  console.log("Session cookie after login:", loginSession ? "PRESENT" : "NONE");

  // Print console
  logs.forEach(l => console.log(`  ${l}`));

  await browser.close();
}

main();
