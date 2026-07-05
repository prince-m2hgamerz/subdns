import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { EmailCapture } from "@/components/landing/email-capture"
import { posts, siteUrl } from "@/lib/blog"
import { Calendar, ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) return {}

  return {
    title: `${post.title} — SubDNS`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      url: `${siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "SubDNS" },
    url: `${siteUrl}/blog/${post.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="pt-16">
        <article className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to blog
              </Link>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time dateTime={post.date}>{post.date}</time>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 display-sm">{post.title}</h1>

              <div className="mt-8 prose prose-invert max-w-none">
                {post.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return <h2 key={i} className="mt-10 mb-4 text-xl font-semibold">{line.slice(3)}</h2>
                  }
                  if (line.startsWith("### ")) {
                    return <h3 key={i} className="mt-8 mb-3 text-lg font-semibold">{line.slice(4)}</h3>
                  }
                  if (line.startsWith("```")) {
                    const lang = line.slice(3)
                    const codeLines: string[] = []
                    i++
                    while (i < post.content.split("\n").length && !post.content.split("\n")[i].startsWith("```")) {
                      codeLines.push(post.content.split("\n")[i])
                      i++
                    }
                    return (
                      <pre key={i} className="my-4 overflow-x-auto rounded-lg border border-border bg-black/50 p-4 text-sm">
                        <code>{codeLines.join("\n")}</code>
                      </pre>
                    )
                  }
                  if (line.startsWith("- [") && line.includes("]")) {
                    return <p key={i} className="text-muted-foreground">{line}</p>
                  }
                  if (line.startsWith("- ")) {
                    return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>
                  }
                  if (line === "") return <br key={i} />
                  return <p key={i} className="mt-4 leading-relaxed text-muted-foreground">{line}</p>
                })}
              </div>
            </div>
          </div>
        </article>

        <EmailCapture />
      </main>
      <Footer />
    </>
  )
}
