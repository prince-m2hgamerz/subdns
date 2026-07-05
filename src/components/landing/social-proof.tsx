import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Alex K.",
    handle: "@alexk",
    avatar: "/avatars/alex.jpg",
    fallback: "AK",
    text: "SubDNS eliminated our staging-infrastructure headaches. Every PR gets a real subdomain with SSL. Game changer for our team.",
    role: "Backend Engineer",
  },
  {
    name: "Sarah M.",
    handle: "@sarahm",
    avatar: "/avatars/sarah.jpg",
    fallback: "SM",
    text: "I use SubDNS for all my side projects. The CLI is fast, the API is clean, and it's free. Can't beat that.",
    role: "Indie Hacker",
  },
  {
    name: "Jordan T.",
    handle: "@jordant",
    avatar: "/avatars/jordan.jpg",
    fallback: "JT",
    text: "Having a dynamic DNS endpoint for my homelab that's backed by Cloudflare is huge. Been rock solid for months.",
    role: "DevOps Engineer",
  },
]

export function SocialProof() {
  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="display-sm">Loved by Developers</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Join thousands of developers using SubDNS for staging, side projects, and production.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.fallback}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
