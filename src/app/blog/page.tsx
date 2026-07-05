import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { EmailCapture } from "@/components/landing/email-capture";
import { Calendar, ArrowRight } from "lucide-react";
import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — SubDNS",
  description: "News, guides, and updates from the SubDNS team. Learn about DNS management, Cloudflare edge, CLI tips, and more.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-lg">Blog</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                News, guides, and updates from the SubDNS team.
              </p>
            </div>
          </div>
        </div>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-12">
              {posts.map((post) => (
                <article key={post.slug}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={post.date}>{post.date}</time>
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">
                    <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline underline-offset-4"
                  >
                    Read more <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <EmailCapture />
      </main>
      <Footer />
    </>
  );
}
