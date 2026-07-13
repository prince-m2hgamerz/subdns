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
          SubDNS respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we have established a process for submitting and responding to copyright infringement notices. If you believe that content hosted on a subdomain managed through our services infringes your copyright, you may submit a DMCA takedown notice. To be effective, your notice must include the following information:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Identification of the copyrighted work claimed to have been infringed, or a representative list of such works</li>
          <li>Identification of the infringing material, including the specific subdomain URL and, if applicable, the exact file or page location</li>
          <li>Your contact information including full name, mailing address, telephone number, and email address</li>
          <li>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law</li>
          <li>A statement that the information in the notice is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
          <li>Your physical or electronic signature</li>
        </ul>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Incomplete notices may not be processed. If your notice does not contain all required elements, we may request additional information or reject the notice. Knowingly submitting false or misleading information may result in legal liability, including claims for damages under Section 512(f) of the DMCA.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Submitting a Notice</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Send DMCA notices to our designated copyright agent at{" "}
          <a href="mailto:dmca@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">dmca@m2hio.in</a>{" "}
          with the subject line &ldquo;DMCA Notice.&rdquo; We will review and respond to valid notices promptly, typically within two to three business days. Upon receipt of a valid notice, we will remove or disable access to the allegedly infringing material and notify the user who posted it.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Counter-Notice</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          If you believe that your content was removed or disabled as a result of mistake or misidentification, you may file a counter-notice. To be effective, your counter-notice must include:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-neutral-600 dark:text-neutral-400">
          <li>Identification of the removed material and its location before removal or disablement</li>
          <li>A statement, under penalty of perjury, that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification</li>
          <li>Your full name, address, telephone number, and email address</li>
          <li>A statement consenting to the jurisdiction of the federal district court for the judicial district in which your address is located (or, if you are outside the United States, for any judicial district in which SubDNS may be found)</li>
          <li>A statement that you will accept service of process from the person who submitted the original notice or their agent</li>
          <li>Your physical or electronic signature</li>
        </ul>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          Counter-notices can be sent to{" "}
          <a href="mailto:dmca@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">dmca@m2hio.in</a>.
          Upon receipt of a valid counter-notice, we will forward it to the original complainant. If the original complainant does not file a court action within 14 business days, we will restore the removed material.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Repeat Infringers</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS maintains a policy of terminating accounts of users who are repeat infringers of copyright in appropriate circumstances. A repeat infringer is any user who has been the subject of more than one valid DMCA notice. We also consider the severity and circumstances of each infringement when determining appropriate action. Users who believe their account has been terminated in error may contact us to explain their situation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Safe Harbor Compliance</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          SubDNS is a service provider as defined in Section 512(k) of the DMCA. We have designated a copyright agent and registered with the United States Copyright Office. We do not host content on our servers; we provide DNS resolution services only. However, we cooperate fully with copyright owners and will disable DNS resolution for subdomains used to facilitate copyright infringement when properly notified.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Modification of Policy</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          We reserve the right to modify this DMCA policy at any time. Changes will be effective immediately upon posting. We encourage copyright owners and users to review this policy periodically for updates. Continued use of the Service after changes constitutes acceptance of the modified policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Contact</h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          For questions about this DMCA policy, contact us at{" "}
          <a href="mailto:support@m2hio.in" className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white">support@m2hio.in</a>.
        </p>
      </section>
    </div>
  );
}
