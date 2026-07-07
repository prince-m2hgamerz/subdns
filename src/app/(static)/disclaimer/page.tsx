import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — SubDNS",
  description: "Disclaimers and limitations of liability for SubDNS subdomain and DNS management services.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Disclaimer</h1>
      <p className="text-sm text-neutral-500">Last updated: July 7, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. No Warranty</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranty of any kind,
          express or implied. We do not guarantee that the service will be uninterrupted, secure,
          or error-free.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. DNS Propagation</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Changes to DNS records may take time to propagate across the internet due to caching
          by ISPs and recursive resolvers. SubDNS is not responsible for propagation delays or
          the unavailability of subdomains during propagation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Third-Party Services</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS integrates with Cloudflare for DNS resolution and edge routing. We are not
          responsible for outages, data loss, or security incidents arising from third-party
          infrastructure.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. User Content</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Subdomains are managed by their respective owners. SubDNS does not monitor, endorse,
          or assume liability for content hosted on user-registered subdomains.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          To the maximum extent permitted by law, SubDNS shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about this disclaimer, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
