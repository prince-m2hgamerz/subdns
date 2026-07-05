import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Policy — SubDNS",
  description: "Copyright infringement notice procedures and takedown process for SubDNS in accordance with the DMCA.",
};

export default function DMCAPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">DMCA Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: July 6, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Notice of Infringement</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS respects the intellectual property rights of others. If you believe that content hosted on a subdomain managed through our services infringes your copyright, you may submit a DMCA takedown notice with the following information:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Identification of the infringing material, including the subdomain URL</li>
          <li>Your contact information (name, address, phone, and email)</li>
          <li>A statement of good faith belief that the use is not authorized</li>
          <li>A statement that the information in the notice is accurate</li>
          <li>Your physical or electronic signature</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Submitting a Notice</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Send DMCA notices to our designated copyright agent at{" "}
          <a href="mailto:dmca@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">dmca@m2hio.in</a>{" "}
          with the subject line &ldquo;DMCA Notice.&rdquo; We will review and respond to valid notices promptly.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Counter-Notice</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you believe your content was removed in error, you may file a counter-notice including:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Identification of the removed material and its location before removal</li>
          <li>A statement of good faith belief that the material was removed by mistake</li>
          <li>Your name, address, and consent to jurisdiction in your local federal court</li>
          <li>Your physical or electronic signature</li>
        </ul>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Counter-notices can be sent to{" "}
          <a href="mailto:dmca@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">dmca@m2hio.in</a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Repeat Infringers</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS maintains a policy of terminating accounts of users who are repeat infringers of copyright. A repeat infringer is any user who has been the subject of more than one valid DMCA notice.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about this DMCA policy, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
