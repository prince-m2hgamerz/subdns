import type { Metadata } from "next";
import Script from "next/script";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "FAQ — SubDNS",
  description:
    "Frequently asked questions about SubDNS free subdomain service, Cloudflare integration, DNS management, and security.",
  alternates: { canonical: "https://subdns.m2hio.in/faq" },
};

const faqs = [
  {
    q: "What is SubDNS?",
    a: "SubDNS is a free subdomain registration service powered by Cloudflare. We let you claim a subdomain under subdns.m2hio.in and manage its DNS records through a web dashboard, CLI, or API.",
  },
  {
    q: "Is SubDNS really free?",
    a: "Yes. Subdomain registration and DNS management through our Cloudflare integration are completely free. There are no hidden charges or trial periods.",
  },
  {
    q: "How do I create a subdomain?",
    a: "Sign in with your Google or GitHub account, choose an available subdomain name, and configure your DNS records (A, AAAA, CNAME, TXT, MX, NS). Your subdomain is live in seconds.",
  },
  {
    q: "What DNS record types do you support?",
    a: "We support A, AAAA, CNAME, TXT, MX, NS, and SRV records — covering everything from basic web hosting to advanced email and service configurations.",
  },
  {
    q: "Can I use my own domain instead of a subdomain?",
    a: "SubDNS focuses on providing free subdomains under subdns.m2hio.in. If you need a custom domain, we recommend pairing our DNS management tools with your own registered domain.",
  },
  {
    q: "How does SubDNS work with Cloudflare?",
    a: "All DNS records are managed through Cloudflare's edge network, giving you fast DNS resolution, DDoS protection, and global CDN caching automatically.",
  },
  {
    q: "Do you offer a CLI tool?",
    a: "Yes. Our CLI lets you manage subdomains and DNS records from the terminal. Install it with npm and automate your infrastructure.",
  },
  {
    q: "Is there an API?",
    a: "Yes. Our REST API supports subdomain creation, DNS management, and TTL configuration. API keys are available on your dashboard.",
  },
  {
    q: "How do I secure my subdomain?",
    a: "We recommend using strong TXT records for SPF/DKIM/DMARC, enabling DNSSEC, keeping TTLs low during migrations, and monitoring your DNS logs for unauthorized changes.",
  },
  {
    q: "What happens if I violate the Acceptable Use Policy?",
    a: "Subdomains used for phishing, malware, spam, or illegal activity are suspended immediately. Repeat violations result in permanent account termination.",
  },
  {
    q: "Can I transfer my subdomain to another DNS provider?",
    a: "Subdomains under subdns.m2hio.in are managed exclusively through Cloudflare. If you need portability, we recommend registering your own domain.",
  },
  {
    q: "How do I delete my account?",
    a: "You can delete your account from the dashboard settings page, which removes all your subdomains and DNS records. Contact support if you need assistance.",
  },
  {
    q: "How many subdomains can I create?",
    a: "Free accounts can create up to 25 subdomains. If you need more for team projects or staging environments, reach out to us about our Enterprise plan which offers higher limits and dedicated support.",
  },
  {
    q: "How long does DNS propagation take?",
    a: "Because SubDNS runs on Cloudflare's edge network, DNS changes typically propagate globally within 30 to 60 seconds. We recommend setting TTL values as low as 120 seconds during active development and raising them to 3600 seconds once your configuration is stable.",
  },
  {
    q: "Does SubDNS support DNSSEC?",
    a: "Yes. DNSSEC adds a cryptographic layer of trust to your DNS records, protecting against spoofing and cache poisoning. You can enable DNSSEC from your subdomain settings page. Once enabled, Cloudflare automatically signs your zone and publishes the DS records.",
  },
  {
    q: "Can I share subdomains with my team?",
    a: "Subdomains are tied to your account, but you can delegate DNS management to team members by sharing your API keys or by setting up delegation NS records that point to your own authoritative nameservers. Enterprise accounts get dedicated team management features.",
  },
  {
    q: "Are there rate limits on the API?",
    a: "The free API tier allows 60 requests per minute per API key. This is sufficient for most automation and CI/CD workflows. Response headers include your current rate limit status. If you need higher limits, contact us about an upgraded plan.",
  },
  {
    q: "Do you monitor subdomains for abuse?",
    a: "Yes. We scan subdomains daily for phishing, malware, and policy violations. Suspicious activity triggers an automated review, and confirmed violations result in immediate suspension. Legitimate users are notified before any action is taken.",
  },
  {
    q: "Can I migrate my existing DNS records to SubDNS?",
    a: "Yes. Your dashboard includes a bulk import tool that accepts BIND zone files and common DNS provider exports. After importing, update your subdomain's nameservers to Cloudflare and the migration is complete. Our support team can assist with complex migrations.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Everything you need to know about SubDNS.
      </p>
      <div className="mt-8 space-y-8">
        {faqs.map((faq, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold text-foreground">{faq.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {faq.a}
            </p>
          </section>
        ))}
      </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
