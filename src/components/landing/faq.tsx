"use client";

import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "What can I build with my subdomain?",
    answer: "Anything you can imagine. A portfolio, an API, a blog, project docs, a landing page, a staging environment, or something we haven't thought of yet. If it lives on the web, it belongs here. Just keep it legal and respectful.",
  },
  {
    question: "Is it really, truly free?",
    answer: "No tricks, no trials, no hidden costs. You get a subdomain, full DNS control, Cloudflare proxying, and automatic SSL — all free, forever. We believe the infrastructure for building on the web should be a public good, not a line item.",
  },
  {
    question: "How fast do DNS changes propagate?",
    answer: "With Cloudflare's global network, changes propagate in seconds — not hours. Most updates are live before you can refresh the page.",
  },
  {
    question: "Can I bring my own custom domain?",
    answer: "SubDNS is designed for m2hio.in subdomains, but you can point your subdomain anywhere using our full set of DNS records. Your little corner of the internet, connected to whatever you build.",
  },
  {
    question: "What DNS record types do you support?",
    answer: "A, AAAA, CNAME, TXT, MX, SRV, and CAA — everything you need to route traffic, verify ownership, and configure email. All managed through Cloudflare's edge.",
  },
  {
    question: "Are there any usage limits?",
    answer: "Free users get 10 subdomains and 50 DNS records per subdomain. If you need more for a bigger project, just reach out — we're happy to help.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const items = sectionRef.current?.querySelectorAll("[data-faq-item]");
    if (items) {
      gsap.fromTo(
        items, { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true } },
      );
    }
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="display-lg">Questions? We've got answers.</h2>
        </div>

        <div className="mx-auto mt-16 max-w-2xl space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              data-faq-item
              className="overflow-hidden rounded-xl border border-gray-alpha-100 bg-card transition-all duration-200 hover:shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    openIndex === i && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-alpha-200 px-5 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
