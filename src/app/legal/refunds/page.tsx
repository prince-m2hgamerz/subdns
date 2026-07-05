import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds & Cancellations — SubDNS",
  description: "Refund policy and cancellation process for SubDNS paid plans and services.",
};

export default function RefundsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Refunds &amp; Cancellations</h1>
      <p className="text-sm text-neutral-500">Last updated: July 6, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Subscription Cancellation</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You may cancel your paid subscription at any time from your account dashboard under Settings &rarr; Billing. Upon cancellation, your plan will remain active until the end of the current billing period. No partial refunds are issued for the remaining days in the billing cycle.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Refund Eligibility</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We offer a full refund within 14 days of the initial purchase if you are unsatisfied with the service. Refund requests must be submitted via email to{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a> with the subject line &ldquo;Refund Request&rdquo; and include your account email.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Non-Refundable Items</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The following are not eligible for refunds:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Renewal charges after the 14-day refund window has passed</li>
          <li>Add-on services or one-time purchases (e.g., premium subdomains)</li>
          <li>Usage overage charges incurred beyond the plan limit</li>
          <li>Accounts terminated for violation of our Terms of Service</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Chargebacks</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you initiate a chargeback without first contacting our support team, your account and all associated subdomains may be suspended or terminated immediately. We encourage you to reach out first so we can resolve any billing issues.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Downgrading to Free</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You may downgrade from a paid plan to the free tier at any time. Your account will be adjusted at the end of the current billing cycle. Subdomains and features that exceed the free tier limits will be subject to the free plan restrictions.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Processing Time</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Approved refunds are processed within 5&ndash;10 business days and credited to the original payment method. The timing of the credit appearing on your statement depends on your payment provider.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For billing questions or refund requests, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
