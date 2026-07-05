import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — SubDNS",
  description: "How SubDNS uses cookies and similar tracking technologies.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: July 4, 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. What Are Cookies</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, authenticate your session, and improve your experience.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Cookies We Use</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="px-4 py-3 text-left font-medium">Cookie</th>
                <th className="px-4 py-3 text-left font-medium">Purpose</th>
                <th className="px-4 py-3 text-left font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-3 font-mono text-xs">next-auth.session-token</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Authentication session</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Session</td>
              </tr>
              <tr className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-3 font-mono text-xs">next-auth.callback-url</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Redirect after login</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Session</td>
              </tr>
              <tr className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-3 font-mono text-xs">next-auth.csrf-token</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">CSRF protection</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Session</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">theme</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Dark/light mode preference</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Managing Cookies</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Most browsers allow you to control cookies through settings. Blocking cookies may affect some functionality of the Service. Refer to your browser&apos;s help documentation for instructions.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Third-Party Cookies</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We do not use third-party tracking cookies or advertising cookies. Only essential cookies required for authentication and basic functionality are used.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about our cookie usage, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
