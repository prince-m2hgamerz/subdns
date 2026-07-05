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
          We collect information you provide when creating an account: name, email address, and any profile information you choose to add. We also collect usage data such as DNS records, subdomain claims, and API requests.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. How We Use Your Data</h2>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>To provide and maintain the SubDNS service</li>
          <li>To communicate service updates and important notices</li>
          <li>To monitor and improve service performance and security</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Data Sharing</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We do not sell your personal data. DNS records and subdomain information are publicly visible as required by the nature of the Domain Name System. We may share data with Cloudflare (our DNS provider) as necessary to operate the service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Data Retention</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We retain your data for as long as your account is active. Upon account deletion, your data is removed within 30 days except where legal retention requirements apply.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Your Rights</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You may access, update, or delete your personal data at any time from your account settings. Contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a> for data requests.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Security</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We implement industry-standard security measures including encryption in transit (TLS), Cloudflare DDoS protection, and regular security audits. However, no service is 100% secure.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Changes to This Policy</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We may update this policy from time to time. Material changes will be communicated via email or a notice on the website.
        </p>
      </section>
    </div>
  );
}
