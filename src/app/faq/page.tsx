import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "FAQ — SubDNS",
  description:
    "Frequently asked questions about SubDNS free subdomain service, Cloudflare integration, DNS management, and security.",
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
];

export default function FAQPage() {
  return (
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
  );
}
