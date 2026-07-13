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
          <li>Hosting or distributing malware, ransomware, viruses, worms, trojan horses, or any malicious code</li>
          <li>Phishing, social engineering, fraudulent schemes, or deceptive practices of any kind</li>
          <li>Hosting illegal content or content that violates applicable local, state, national, or international laws</li>
          <li>DNS abuse, including DNS amplification attacks, DNS tunneling, unauthorized zone transfers, or DNS rebinding</li>
          <li>Spam, email harvesting, address scanning, or sending unsolicited bulk messages of any kind</li>
          <li>Copyright or trademark infringement, including hosting pirated software, media, or counterfeit goods</li>
          <li>Impersonating individuals, organizations, or SubDNS itself</li>
          <li>Operating proxy or VPN services designed to circumvent geo-restrictions or network blocks</li>
          <li>Cryptocurrency mining without user consent, including browser-based mining scripts</li>
          <li>Port scanning, vulnerability scanning, or penetration testing of SubDNS infrastructure or other users</li>
          <li>Hosting or distributing content depicting child exploitation, non-consensual intimate imagery, or extreme violence</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Resource Abuse</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You may not use SubDNS services in a way that abuses or degrades the platform infrastructure. This includes excessive API calls exceeding documented rate limits, attempting to bypass rate limits or access controls, exploiting vulnerabilities in the Service, interfering with other users&apos; subdomains and DNS records, or engaging in any activity that places an unreasonable burden on our servers.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We monitor platform usage for abusive patterns. Continuous or aggressive resource consumption beyond what is typical for legitimate use may result in rate limiting, account suspension, or termination without prior notice. If your project requires higher API rate limits or additional resources, please contact us to discuss an appropriate plan.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Subdomain Squatting</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Claiming subdomains with no intention of active use (squatting) is prohibited. We reserve the right to reclaim inactive or parked subdomains after a reasonable period to ensure fair access for all users. A subdomain is considered inactive if it has no DNS records configured or if its records consistently fail to resolve for 30 consecutive days. High-value or generic subdomains may be subject to stricter inactivity policies.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you have a legitimate need to reserve a subdomain without immediate use, please contact us to discuss your situation. We may grant exceptions for planned projects or brand protection on a case-by-case basis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Content Standards</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Content hosted at or linked through your subdomain must comply with these standards:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Must not violate any applicable law or regulation</li>
          <li>Must not infringe on any third-party intellectual property rights</li>
          <li>Must not contain hateful, discriminatory, or harassing material</li>
          <li>Must not promote violence, terrorism, or illegal activities</li>
          <li>Must not contain misleading, deceptive, or fraudulent information</li>
          <li>Must not distribute unsolicited commercial communications</li>
          <li>Must not bypass or circumvent our security measures or those of third parties</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Reporting Violations</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you encounter a subdomain or user violating this policy, please report it to{" "}
          <a href="mailto:abuse@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">abuse@m2hio.in</a>.
          Include the subdomain URL, a description of the violation, and any evidence supporting your report. We review all reports promptly and take appropriate action, which may include suspension or termination of the offending account. We may not disclose the specific action taken in response to a report.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Enforcement</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Violation of this policy may result in immediate suspension or termination of your account without prior notice. Severe or repeated violations may result in a permanent ban from the Service. We reserve the right to take any action we deem necessary to protect the platform, its users, and the integrity of the DNS ecosystem. Enforcement actions are at our sole discretion and are not subject to appeal, though we will consider good-faith explanations submitted to our support team.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about this policy, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
