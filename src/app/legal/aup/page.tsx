import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — SubDNS",
  description: "Rules and guidelines for acceptable use of SubDNS subdomain and DNS management services.",
};

export default function AUPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Acceptable Use Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: July 6, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Prohibited Activities</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The following activities are strictly prohibited when using SubDNS services:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Hosting or distributing malware, ransomware, viruses, or malicious scripts</li>
          <li>Phishing, social engineering, or fraudulent schemes</li>
          <li>Hosting illegal content or content that violates applicable laws</li>
          <li>DNS abuse, including DNS amplification attacks or unauthorized zone transfers</li>
          <li>Spam, email harvesting, or sending unsolicited bulk messages</li>
          <li>Copyright or trademark infringement</li>
          <li>Impersonating individuals, organizations, or SubDNS itself</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Resource Abuse</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You may not use SubDNS services in a way that abuses or degrades the platform infrastructure. This includes excessive API calls, attempting to bypass rate limits, exploiting vulnerabilities, or interfering with other users&apos; subdomains and DNS records.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Subdomain Squatting</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Claiming subdomains with no intention of active use (squatting) is prohibited. We reserve the right to reclaim inactive or parked subdomains after a reasonable period to ensure fair access for all users.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Reporting Violations</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you encounter a subdomain or user violating this policy, report it to{" "}
          <a href="mailto:abuse@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">abuse@m2hio.in</a>.
          We review all reports and take appropriate action, which may include suspension or termination of the offending account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Enforcement</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Violation of this policy may result in immediate suspension or termination of your account without prior notice. Severe or repeated violations may result in a permanent ban from the service. We reserve the right to take any action we deem necessary to protect the platform and its users.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about this policy, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
