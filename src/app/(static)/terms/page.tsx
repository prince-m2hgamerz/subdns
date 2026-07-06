import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SubDNS",
  description: "The terms and conditions governing your use of SubDNS free subdomain services and DNS management tools.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Acceptance</h2>
          <p className="mt-2">
            By using SubDNS ("the Service"), you agree to these Terms of Service. If you
            do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Account Responsibility</h2>
          <p className="mt-2">
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activity under your account. You must provide accurate
            registration information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Acceptable Use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Use the Service for any illegal purpose</li>
            <li>Register subdomains that infringe on trademarks or intellectual property</li>
            <li>Use the Service for phishing, malware distribution, or spam</li>
            <li>Attempt to circumvent rate limits or abuse the infrastructure</li>
            <li>Resell subdomains without our written consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Service Availability</h2>
          <p className="mt-2">
            We strive for 99.9% uptime but do not guarantee uninterrupted service. We
            reserve the right to suspend services for maintenance, security, or policy
            violations. We are not liable for DNS propagation delays.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Limitation of Liability</h2>
          <p className="mt-2">
            The Service is provided "as is" without warranty of any kind. We are not
            liable for any indirect, incidental, or consequential damages arising from
            your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Termination</h2>
          <p className="mt-2">
            We may suspend or terminate your account for violation of these terms, with
            or without notice. You may terminate your account at any time via your
            dashboard settings. Upon termination, your subdomains will be released.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p className="mt-2">
            We may update these terms from time to time. We will notify you of material
            changes via email or a notice on our platform. Continued use after changes
            constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
