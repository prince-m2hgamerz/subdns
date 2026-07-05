import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SubDNS",
  description: "Terms and conditions for using SubDNS subdomain and DNS management services.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-neutral-500">Last updated: July 4, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          By accessing or using SubDNS (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Service Description</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS provides free subdomain registration and DNS management services powered by Cloudflare. Users may claim subdomains under participating root domains and manage DNS records through a web dashboard or REST API.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>You must not use the Service for illegal activities, phishing, malware distribution, or spam.</li>
          <li>You are responsible for the content hosted at your subdomain.</li>
          <li>You must not impersonate others or misrepresent your identity.</li>
          <li>You must comply with all applicable laws and regulations.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Acceptable Use</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The following activities are prohibited: distributing malware, phishing, hosting illegal content, DNS abuse, trademark infringement, and any activity that disrupts the Service or its infrastructure.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Termination</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We reserve the right to suspend or terminate accounts that violate these terms, without prior notice. You may delete your account at any time from the dashboard.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Disclaimer</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We are not responsible for downtime, data loss, or DNS propagation delays.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about these terms, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
