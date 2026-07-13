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
          Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, authenticate your session, and improve your overall experience. Cookies can be &ldquo;session&rdquo; cookies (deleted when you close your browser) or &ldquo;persistent&rdquo; cookies (remain until they expire or are deleted). We also use local storage and similar client-side storage technologies for certain functionality.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Cookies We Use</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We use only essential cookies required for authentication, security, and basic functionality. No tracking, advertising, or analytics cookies are used unless you explicitly consent.
        </p>
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
              <tr className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-3 font-mono text-xs">__Secure-next-auth.callback-url</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Secure redirect after login</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">Session</td>
              </tr>
              <tr className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="px-4 py-3 font-mono text-xs">__Host-next-auth.csrf-token</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">CSRF protection (secure)</td>
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
        <h2 className="text-2xl font-semibold">3. Consent</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For strictly essential cookies (such as authentication tokens and CSRF tokens), consent is not required as they are necessary for the Service to function. For any non-essential cookies, we will request your consent through a cookie consent banner before placing them on your device. You can change your cookie preferences at any time through your browser settings.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Managing Cookies</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Most browsers allow you to control cookies through their settings. You can typically find these settings in the &ldquo;Privacy&rdquo; or &ldquo;Security&rdquo; section of your browser. Blocking all cookies may prevent you from logging into the Service or using certain features. You can also delete existing cookies through your browser settings.
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          To manage cookies in your browser, refer to the help documentation for your specific browser. Most browsers support the following controls: viewing cookies stored on your device, deleting individual or all cookies, blocking cookies from specific sites, and blocking all third-party cookies. Blocking essential cookies will impact the functionality of the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Third-Party Cookies</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We do not use third-party tracking cookies or advertising cookies. Only essential cookies required for authentication and basic functionality are used, along with a single preference cookie for theme selection. We do not use analytics services that set cookies, social media pixels, or any other tracking technologies. Our payment processor may set their own cookies when you visit our billing pages. Please refer to their privacy policies for more information.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Local Storage</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          In addition to cookies, we may use browser local storage to cache certain preferences and reduce server requests. Local storage data is not automatically transmitted to us and is used primarily for client-side functionality. You can clear local storage through your browser settings without affecting cookie settings.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Policy Updates</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We may update this Cookie Policy from time to time to reflect changes in the cookies we use or applicable regulations. If we make material changes, we will notify you by updating the &ldquo;Last updated&rdquo; date at the top of this page and may provide additional notice through the Service. We encourage you to review this policy periodically.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about our cookie usage or this policy, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
