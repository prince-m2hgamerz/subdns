# SubDNS — Marketing Strategy

*Leverage 59 installed skills. All references reference skills in `.agents/skills/`.*

---

## Current State

| Area | Status |
|------|--------|
| Landing page | Done |
| Pricing | Done (Free / Pro / Team) |
| Blog | 5 posts |
| Docs | Getting started, CLI guide, API reference |
| Social | None |
| Email | None |
| SEO | Basic meta tags on key pages |
| Referral | None |
| Community | GitHub repo only |
| Ads | None |
| Analytics | None detected (PostHog skill installed but not configured) |

---

## Strategy Overview

**North Star:** Every developer globally knows they can get a free subdomain at SubDNS.

**Three Pillars:**
1. **SEO + Content** — Own "free subdomain" search terms long-term
2. **Viral / Referral** — Turn every user into an advocate (free product = low friction to share)
3. **Conversion** — Free → Pro/Team upgrade through email nurture and in-product prompts

---

## Phase 1: Foundation (Weeks 1-4)

### 1.1 SEO — Keyword & Content Foundation
*Skills: seo-keyword-strategist, seo-technical, seo-content*

**Primary Keywords to target:**
- `free subdomain` (high intent)
- `free dns` (medium intent)
- `free subdomain for vercel` / `free subdomain for netlify` (platform-specific)
- `free dns hosting` / `free dns management`
- `subdomain for github pages` / `subdomain for my project`

**Content to create (in priority order):**
1. Platform-specific guides: "How to Set Up a Free Subdomain on [Vercel/Netlify/Railway/GitHub Pages]"
2. Comparison page: "SubDNS vs freedns.afraid.org vs nip.io — Free Subdomain Comparison"
3. Technical SEO fixes: audit robots.txt, sitemap, Core Web Vitals, structured data
4. Blog posts targeting long-tail keywords (one per week)

### 1.2 Social Presence
*Skills: twitter-automation, linkedin-automation, social-content*

**Twitter/X:**
- Create account: @subdns (or similar)
- Post 3-5x/week: tips, use cases, product updates, developer humor
- Engage with dev community: reply to "how do I get a free domain" type questions

**LinkedIn:**
- Creator profile for the founder
- Share technical deep-dives and product milestones

### 1.3 Email Capture
*Skills: email-sequence, lead-magnets*

**Implement:**
- Post-signup welcome email sequence (3-5 emails)
  - Email 1: Welcome + quick start guide
  - Email 2: CLI & API tips
  - Email 3: Pro features teaser
  - Email 4: Case study / use case
  - Email 5: Upgrade offer
- Blog subscribe CTA (capture email on blog pages)
- Newsletter: "SubDNS Monthly" — product updates, tips, community highlights

**Tools:** SubDNS has `sendgrid-automation`, `convertkit-automation`, `mailchimp-automation`, `brevo-automation` skills available.

---

## Phase 2: Growth (Weeks 5-8)

### 2.1 Viral / Referral Loop
*Skills: referral-program, free-tools*

**Referral Program:**
- Every user gets a referral link
- Referrer gets: bonus subdomain slots, featured on /wall-of-love, early access to features
- Referee gets: nothing extra (product is already free), but maybe accelerated limits

**Social Proof / Wall of Love:**
- `/wall-of-love` page showcasing projects built on SubDNS
- Tweets/testimonials embedded on landing page
- GitHub star counter prominently displayed

### 2.2 Community Marketing
*Skills: community-marketing*

- Launch GitHub Discussions for Q&A, show-and-tell, feature requests
- Consider Discord server for real-time community
- Monthly "Built on SubDNS" showcase

### 2.3 Conversion Optimization
*Skills: signup-flow-cro, onboarding-cro, paywall-upgrade-cro, popup-cro*

**Free → Pro conversion levers:**
- In-dashboard upgrade prompts at limit thresholds (4/5 subdomains used)
- Feature comparison on dashboard
- Pro trial (7 days free) with no credit card
- Remove friction: upgrade CTA in CLI output ("Pro tip: Pro users get CLI access")

**Signup flow optimization:**
- Reduce signup friction (GitHub OAuth?)
- Track dropoff points
- A/B test headline, CTA, feature presentation

---

## Phase 3: Scale (Weeks 9+)

### 3.1 Paid Ads
*Skills: ad-creative, paid-ads*

Low priority until organic channels are saturated.

- **Google Ads:** "free subdomain", "free dns hosting" keywords
- **Meta/Reddit ads:** Target developer audiences, indie hackers
- **Retargeting:** Pixel on landing page → retarget blog readers

### 3.2 Strategic Partnerships
- Partner with Vercel, Netlify, Railway (they benefit from users having subdomains)
- Guest posts on dev blogs
- Sponsor open source projects

### 3.3 PR / Launch Campaigns
*Skills: launch-strategy*

- Product Hunt launch (if not done)
- Hacker News "Show HN"
- Indie Hackers launch
- Dev.to cross-posts

---

## Content Calendar Template

| Week | Blog Post | Social Focus | Other |
|------|-----------|-------------|-------|
| 1 | "How to Get a Free Subdomain for Your Vercel Project" | Twitter: launch tips | SEO audit |
| 2 | "SubDNS vs freedns.afraid.org — Which is Better?" | LinkedIn: technical comparison | Email welcome sequence |
| 3 | "5 Use Cases for Free Subdomains (Beyond Personal Projects)" | Twitter: use case thread | Discord launch |
| 4 | "How We Built SubDNS on Cloudflare's Edge" | Engineering deep-dive | Referral program MVP |
| 5 | "Automating Deployments with SubDNS CLI" | Twitter: CLI tips | Upgrade email sequence |
| 6 | "Securing Your Subdomain: Best Practices" | LinkedIn: security | Wall of love page |
| Ongoing | Platform-specific guides series | Daily engagement | Iterate based on data |

---

## Metrics & KPIs

| Metric | Target (3 months) |
|--------|------------------|
| Monthly active users | Track baseline → +50% |
| Blog traffic | 5,000+ monthly visits |
| Free → Pro conversion rate | 3-5% |
| Email subscribers | 1,000+ |
| Twitter followers | 500+ |
| Referral signups | 15% of total signups |

---

## Skill Execution Plan

| Task | Skill(s) to Use | Priority |
|------|----------------|----------|
| SEO keyword research | seo-keyword-strategist, seo-dataforseo | P1 |
| Technical SEO audit | seo-technical, seo-sitemap | P1 |
| Blog post writing | seo-content-writer, seo-aeo-blog-writer | P1 |
| Email welcome sequence | email-sequence, cold-email | P1 |
| Twitter account setup & posting | twitter-automation, social-content | P1 |
| LinkedIn presence | linkedin-automation, social-content | P2 |
| Referral program design | referral-program | P2 |
| CRO: signup flow | signup-flow-cro | P2 |
| CRO: upgrade prompts | paywall-upgrade-cro | P2 |
| Social proof / wall of love | social-proof-architect | P2 |
| Community setup | community-marketing | P2 |
| Google Ads (later) | ad-creative, paid-ads | P3 |
| Product Hunt launch | launch-strategy | P3 |
| Brand assets refinement | brandkit | P3 |
