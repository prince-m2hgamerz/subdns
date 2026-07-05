import type { MetadataRoute } from "next"

const siteUrl = "https://subdns.m2hio.in"

const posts = [
  { slug: "subdomain-takeover-prevention-guide", date: "2025-08-15" },
  { slug: "cloudflare-dns-automation-tutorial", date: "2025-09-01" },
  { slug: "why-free-subdomains-are-risky", date: "2025-09-10" },
  { slug: "setting-up-dyndns-with-cloudflare", date: "2025-09-20" },
  { slug: "harden-cloudflare-security-headers", date: "2025-10-05" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/brand`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/changelog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/enterprise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
