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
          By accessing or using SubDNS (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. Continued use of the Service after any modifications to these terms constitutes acceptance of the modified terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Service Description</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS provides free subdomain registration and DNS management services powered by Cloudflare. Users may claim subdomains under participating root domains and manage DNS records through a web dashboard or REST API. The Service is provided on a &ldquo;as available&rdquo; basis and we do not guarantee uninterrupted or error-free operation. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS does not provide web hosting. The Service is strictly limited to DNS resolution and subdomain management. You are responsible for procuring and maintaining your own hosting infrastructure for any content served through your subdomains.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Account Registration</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You must create an account to use the Service. You agree to provide accurate, current, and complete information during registration and to keep your account credentials confidential. You are responsible for all activity that occurs under your account. Notify us immediately of any unauthorized use at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Each person may maintain only one account. Accounts registered with automated methods, temporary email addresses, or fraudulent information are subject to immediate termination. You may not transfer your account to another party without our written consent.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. User Responsibilities</h2>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>You must not use the Service for illegal activities, phishing, malware distribution, or spam.</li>
          <li>You are responsible for the content hosted at your subdomain, including all third-party content that users may access through your subdomain.</li>
          <li>You must not impersonate others or misrepresent your identity or affiliation with any person or entity.</li>
          <li>You must comply with all applicable local, state, national, and international laws and regulations.</li>
          <li>You must not attempt to circumvent any security measures, rate limits, or access controls implemented by the Service.</li>
          <li>You are responsible for regularly reviewing your DNS records for accuracy and security.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Acceptable Use</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The following activities are prohibited: distributing malware, phishing, hosting illegal content, DNS abuse, trademark infringement, and any activity that disrupts the Service or its infrastructure. A complete list of prohibited activities is detailed in our Acceptable Use Policy, which is incorporated into these terms by reference. Violation of the Acceptable Use Policy constitutes a breach of these Terms of Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. API Usage</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Access to the REST API is subject to rate limits documented in our developer documentation. You agree not to exceed these limits or attempt to circumvent them. API keys must be kept confidential and not shared with unauthorized parties. We reserve the right to revoke API access for abusive usage patterns without prior notice.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Termination</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We reserve the right to suspend or terminate accounts that violate these terms, without prior notice. You may delete your account at any time from the dashboard. Upon termination, all subdomains and DNS records associated with your account will be removed. We are not liable for any damages resulting from account suspension or termination. If your account remains inactive for more than twelve consecutive months, we may deactivate it and reclaim associated subdomains.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS, its operators, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to the use of the Service. This includes, but is not limited to, damages for loss of profits, goodwill, data, or other intangible losses, even if we have been advised of the possibility of such damages. Our total liability for any claim arising from the use of the Service shall not exceed the amount paid by you to us in the twelve months preceding the claim.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Indemnification</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You agree to indemnify, defend, and hold harmless SubDNS, its operators, affiliates, and service providers from any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from your use of the Service, your violation of these terms, or your infringement of any third-party rights. We reserve the right to assume exclusive defense and control of any matter subject to indemnification, in which case you agree to cooperate with our defense.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Disclaimer</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. We do not warrant that the Service will meet your requirements, be uninterrupted, timely, secure, or error-free. We are not responsible for downtime, data loss, DNS propagation delays, or actions taken by Cloudflare or other third-party infrastructure providers. No advice or information obtained from the Service shall create any warranty not expressly stated in these terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Governing Law</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved exclusively in the courts of India. The United Nations Convention on Contracts for the International Sale of Goods does not apply to these terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">12. Modifications</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We may revise these terms at any time by posting an updated version on this page. Material changes will be communicated via email or a prominent notice on the Service. Your continued use after such notice constitutes acceptance of the revised terms. If you do not agree to the revised terms, you must stop using the Service and delete your account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">13. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about these terms, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
