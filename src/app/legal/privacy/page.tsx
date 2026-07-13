import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SubDNS",
  description: "How SubDNS collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: July 4, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We collect information you provide when creating an account: name, email address, and any profile information you choose to add. We also collect usage data such as DNS records, subdomain claims, API requests, IP addresses, browser user-agent strings, and timestamps of your interactions with the Service. This data is necessary for the operation, security, and improvement of our services.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We do not collect sensitive personal data such as racial or ethnic origin, political opinions, religious beliefs, health information, or biometric data. If you voluntarily provide such information (for example, in a support ticket), we will treat it with appropriate confidentiality and delete it once it is no longer needed to resolve your inquiry.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. How We Use Your Data</h2>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>To provide and maintain the SubDNS service, including DNS resolution and subdomain management</li>
          <li>To communicate service updates, important notices, and billing information</li>
          <li>To monitor and improve service performance, reliability, and security</li>
          <li>To detect, prevent, and respond to fraud, abuse, or violations of our terms</li>
          <li>To comply with legal obligations and law enforcement requests</li>
          <li>To generate anonymized aggregate statistics about service usage</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Legal Basis for Processing</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We process your data based on the following legal grounds and corresponding purposes under applicable data protection laws:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li><strong>Contractual necessity</strong> &mdash; to provide the Service you requested</li>
          <li><strong>Legitimate interests</strong> &mdash; to maintain and improve service security, prevent abuse, and analyze usage patterns</li>
          <li><strong>Legal compliance</strong> &mdash; to fulfill obligations under applicable laws and regulations</li>
          <li><strong>Consent</strong> &mdash; where we ask for your explicit permission for specific processing activities</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Data Sharing</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We do not sell your personal data. DNS records and subdomain information are publicly visible as required by the nature of the Domain Name System. We may share data with Cloudflare (our DNS provider) as necessary to operate the service. We may also share data with payment processors for billing purposes, and with analytics providers who process data under strict data processing agreements.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We will disclose your personal information if required by law, legal process, or governmental request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others. We will notify you of such disclosure where permitted by law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Data Retention</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We retain your data for as long as your account is active. Upon account deletion, your personal data is removed within 30 days except where legal retention requirements apply. DNS records and subdomain information may persist in DNS caches beyond our control for the duration of their TTL (time to live) settings. Anonymized and aggregated data may be retained indefinitely for analytical purposes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. International Data Transfers</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Your data may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws through appropriate safeguards, including Standard Contractual Clauses approved by relevant authorities. Our infrastructure providers (Cloudflare, database hosts) maintain data centers in multiple regions, and we take steps to ensure your data receives adequate protection regardless of where it is processed.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Your Rights</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may also have the right to restrict or object to certain processing activities. You can exercise most of these rights directly from your account settings. For assistance, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>. We will respond to your request within the timeframe required by applicable law. If you are in the European Economic Area, you also have the right to lodge a complaint with your local data protection authority.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. California Privacy Rights</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with additional rights regarding your personal information. You have the right to know what personal information we collect, the sources from which it is collected, the business purpose for collecting it, and the categories of third parties with whom we share it. You have the right to request deletion of your personal information and the right to opt out of the sale of your personal information. We do not sell your personal information.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Children&apos;s Privacy</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The Service is not directed at individuals under the age of 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it immediately. If you believe a child has provided us with personal information, please contact us.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Security</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We implement industry-standard security measures including encryption in transit (TLS 1.2+), Cloudflare DDoS protection, regular security audits, access controls, and incident response procedures. However, no service or data transmission over the internet is 100% secure. We cannot guarantee absolute security of your data. You are responsible for maintaining the security of your account credentials and promptly notifying us of any unauthorized access.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Third-Party Services</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Our Service may contain links to third-party websites or services not operated by us. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing them with any personal information. This Privacy Policy applies only to data collected by SubDNS.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">12. Changes to This Policy</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We may update this policy from time to time. Material changes will be communicated via email or a notice on the website. We encourage you to review this policy periodically. The &ldquo;Last updated&rdquo; date at the top of this page indicates when the policy was last revised.
        </p>
      </section>
    </div>
  );
}
