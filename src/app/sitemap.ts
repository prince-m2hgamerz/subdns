import type { MetadataRoute } from "next"
import { posts } from "@/lib/blog"
import fs from "fs"
import path from "path"

const siteUrl = "https://subdns.m2hio.in"

const tutorialSlugs = (() => {
  try {
    const dir = path.join(process.cwd(), "docs", "tutorials")
    return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""))
  } catch {
    return ["getting-started", "platform-guide", "how-subdns-works", "dns-management", "cli-guide"]
  }
})()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },

    { url: `${siteUrl}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/verify`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },

    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },

    { url: `${siteUrl}/docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/docs/cli`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/docs/api`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/docs/sdk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...tutorialSlugs.map((slug) => ({
      url: `${siteUrl}/docs/tutorials/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    { url: `${siteUrl}/brand`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/changelog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/enterprise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/status`, lastModified: new Date(), changeFrequency: "daily", priority: 0.3 },

    { url: `${siteUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/aup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/dmca`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/refunds`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },

    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
