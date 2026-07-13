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
          You may cancel your paid subscription at any time from your account dashboard under Settings &rarr; Billing. Upon cancellation, your plan will remain active until the end of the current billing period. No partial refunds are issued for the remaining days in the billing cycle. You will continue to have access to all paid features until the end of your billing period, after which your account will revert to the free tier.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          To avoid being charged for the next billing period, you must cancel before the renewal date. We recommend canceling at least 24 hours before your renewal date to ensure the cancellation is processed in time. You will receive a confirmation email once your cancellation is processed.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Refund Eligibility</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We offer a full refund within 14 days of the initial purchase if you are unsatisfied with the service for any reason. This 14-day money-back guarantee applies only to the first purchase of a paid plan and does not apply to subsequent renewals. Refund requests must be submitted via email to{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a> with the subject line &ldquo;Refund Request&rdquo; and include your account email and the reason for your request.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Non-Refundable Items</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          The following are not eligible for refunds:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Renewal charges after the 14-day refund window has passed</li>
          <li>Add-on services or one-time purchases (e.g., premium subdomains or vanity domains)</li>
          <li>Usage overage charges incurred beyond the plan limit</li>
          <li>Accounts terminated for violation of our Terms of Service or Acceptable Use Policy</li>
          <li>Downgrade credits or prorated amounts for unused service periods</li>
          <li>Third-party fees, including payment processor charges or currency conversion fees</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Service Credits</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          In cases of extended service outages or significant degradation of service quality, we may issue service credits at our discretion. Service credits are applied to your account as a balance toward future billing and are not redeemable for cash. To request a service credit, please contact our support team with details of the issue and its impact on your usage. Service credits are typically considered for outages exceeding 4 hours of continuous downtime within a 24-hour period.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Chargebacks</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you initiate a chargeback with your payment provider without first contacting our support team, your account and all associated subdomains may be suspended or terminated immediately. We incur fees and administrative overhead from chargebacks that we must recover. We strongly encourage you to reach out first so we can resolve any billing issues directly. Our support team is responsive and will work with you to find a fair resolution.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If a chargeback is initiated and later reversed in our favor, we will reinstate your account if it was suspended, but we cannot guarantee that all subdomains and configurations will be restored. We recommend regularly backing up your DNS records.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Downgrading to Free</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          You may downgrade from a paid plan to the free tier at any time. Your account will be adjusted at the end of the current billing cycle. Subdomains and features that exceed the free tier limits will be subject to the free plan restrictions. If you have more subdomains than the free tier allows, you must delete the excess before the downgrade takes effect, or they will be automatically disabled. We will notify you before any automatic disabling occurs.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Billing Disputes</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you believe you have been billed incorrectly, please contact us within 30 days of the billing date. We will investigate and correct any verified errors promptly. Billing disputes outside this 30-day window may not be honored except in cases of fraud or clear error. During the dispute investigation, your account will remain active and accessible.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Processing Time</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Approved refunds are processed within 5&ndash;10 business days and credited to the original payment method. The timing of the credit appearing on your statement depends on your payment provider. Credit card refunds typically appear within 3&ndash;5 business days, while PayPal and other payment methods may take longer. You will receive an email confirmation when the refund has been initiated.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For billing questions or refund requests, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
          Please include your account email and a clear description of your issue to help us respond quickly.
        </p>
      </section>
    </div>
  );
}
