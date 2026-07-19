import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Elena Marchetti",
    role: "Lead AI Engineer",
    company: "Synthetix Labs",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
    text: "PromptForge cut our prompt iteration cycle from hours to minutes. The multi-model compilation is genuinely useful — we ship optimized prompts for Midjourney and DALL-E 3 in a single workflow now.",
    rating: 5,
    featured: true,
  },
  {
    name: "Marcus Chen",
    role: "Founder",
    company: "SaaSify",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    text: "We integrated PromptForge into our content pipeline last quarter. The brand style tokens alone saved us from the prompt drift we kept fighting. Essential tool for any team serious about AI output quality.",
    rating: 5,
    featured: false,
  },
  {
    name: "Aisha Patel",
    role: "Product Designer",
    company: "Meridian Studio",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
    text: "As a designer who works across tools daily, PromptForge is the one I keep open. The UI is clean, the compiler is fast, and the vision analysis feature has become my go-to for reverse-engineering visual styles.",
    rating: 5,
    featured: false,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-accent/[0.03] blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-5">
            <Quote className="h-3 w-3" />
            Trusted by builders
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by teams shipping AI products
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
            From solo founders to enterprise teams — hear how PromptForge
            transforms the way people write and scale AI prompts.
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                review.featured
                  ? "border-accent/30 bg-gradient-to-b from-accent/[0.06] to-card shadow-lg shadow-accent/[0.06]"
                  : "border-border bg-card hover:border-border-hover"
              }`}
            >
              {/* Featured badge */}
              {review.featured && (
                <div className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-accent px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md shadow-accent/25">
                  Featured
                </div>
              )}

              <div>
                <StarRating count={review.rating} />

                <blockquote className="mt-4 text-sm leading-relaxed text-muted/90">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
              </div>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border/60">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border ring-offset-2 ring-offset-card"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {review.name}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {review.role} at{" "}
                    <span className={review.featured ? "text-accent font-medium" : ""}>
                      {review.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom social proof bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            2,400+ prompts compiled this week
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            180+ active teams
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            4.9 average rating
          </span>
        </div>
      </div>
    </section>
  );
}