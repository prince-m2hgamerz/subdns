import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SubDNS",
  description: "How SubDNS collects, uses, and protects your personal information when you use our free subdomain services.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
          <p className="mt-2">
            When you create an account, we collect your name, email address, and any profile
            information you choose to provide. We also collect data about the subdomains you
            register and DNS records you configure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">How We Use Your Data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To operate and maintain your subdomain and DNS services</li>
            <li>To communicate service updates, security notices, and support responses</li>
            <li>To improve our platform and detect abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Data Sharing</h2>
          <p className="mt-2">
            We do not sell your personal data. We may share limited data with Cloudflare
            (our infrastructure provider) solely for the purpose of DNS resolution and
            edge routing. We use analytics tools that operate on anonymized, aggregated data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Data Retention</h2>
          <p className="mt-2">
            We retain your account data for as long as your account is active. You may
            request deletion at any time via your account settings or by contacting us.
            DNS zone data is retained per Cloudflare's data retention policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Your Rights</h2>
          <p className="mt-2">
            Depending on your jurisdiction, you may have the right to access, correct,
            delete, or port your data. To exercise these rights, contact us at
            privacy@subdns.example.com.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management. We do not
            use third-party tracking cookies. You can control cookie preferences in your
            browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            For privacy-related inquiries, contact our Data Protection Officer at
            dpo@subdns.example.com.
          </p>
        </section>
      </div>
    </div>
  );
}
