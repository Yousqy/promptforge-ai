import Link from "next/link";
import { ArrowRight, Play, Zap, Palette, Workflow, Star } from "lucide-react";

// ─── Hero Section ───────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-32 pb-24 border-b border-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-xs font-semibold text-orange-400 tracking-wide uppercase mb-8">
          <Zap className="h-3.5 w-3.5" />
          Cross-Model Prompt Compiler
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
          Write once.{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Compile for any model.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Transform your raw ideas into optimized, model-specific syntax. One
          input, four outputs, zero friction.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 font-semibold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <a
            href="#features"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <Play className="h-4 w-4" />
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Features Bento Grid ────────────────────────────────────────────────────
export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Multi-Model Mastery",
      description:
        "Compile for Midjourney, DALL-E, Claude, and GPT-4 simultaneously. One prompt, every platform.",
      span: "md:col-span-2 md:row-span-2",
      highlight: true,
    },
    {
      icon: Palette,
      title: "Style Token Library",
      description:
        "Access professional design tokens for consistent, high-quality results across every generation.",
      span: "",
      highlight: false,
    },
    {
      icon: Workflow,
      title: "Zero Friction Workflow",
      description:
        "Spend less time prompting, more time creating. Our pipeline handles the complexity.",
      span: "",
      highlight: false,
    },
  ];

  return (
    <section id="features" className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <h2 className="text-base font-semibold leading-7 text-orange-500 tracking-wide uppercase">
            Core Engine
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineered for cross-model scale
          </p>
          <p className="mt-4 text-base text-zinc-400">
            A premium architectural look into our processing stack. Zero bloat,
            maximum performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-3xl bg-zinc-900/40 border border-zinc-900 p-8 flex flex-col justify-between relative overflow-hidden group ${f.span}`}
            >
              {f.highlight && (
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/15 transition-all duration-500" />
              )}
              <div className="space-y-4 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {f.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof / Testimonials ────────────────────────────────────────────
export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Elena Marchetti",
      role: "Lead AI Engineer, Synthetix Labs",
      text: "PromptForge cut our prompt iteration cycle from hours to minutes. The multi-model compilation is genuinely useful — we ship optimized prompts for Midjourney and DALL-E 3 in a single workflow now.",
    },
    {
      name: "Marcus Chen",
      role: "Founder, SaaSify",
      text: "We integrated PromptForge into our content pipeline last quarter. The brand style tokens alone saved us from the prompt drift we kept fighting.",
    },
    {
      name: "Aisha Patel",
      role: "Product Designer, Meridian Studio",
      text: "As a designer who works across tools daily, PromptForge is the one I keep open. The compiler is fast, and the vision analysis feature has become my go-to.",
    },
  ];

  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for Creators & Developers
          </h2>
          <p className="mt-4 text-base text-zinc-400 max-w-lg mx-auto">
            Trusted by teams shipping AI products worldwide.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-orange-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Summary ────────────────────────────────────────────────────────
export function PricingSummary() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "50 compilations / month. Perfect for trying out PromptForge.",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "Unlimited compilations + Advanced history. For professionals.",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large-scale corporations. Dedicated support & API access.",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start free, scale as you grow
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            No hidden fees. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-orange-500/30 shadow-2xl shadow-orange-500/5 bg-zinc-900/40"
                  : "border-zinc-900 bg-zinc-900/20"
              }`}
            >
              {tier.highlighted && (
                <span className="mb-4 inline-block w-fit rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-zinc-950">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                {tier.period && (
                  <span className="text-sm text-zinc-500">{tier.period}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-zinc-400">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer CTA ─────────────────────────────────────────────────────────────
export function FooterCTA() {
  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Ready to supercharge your prompts?
        </h2>
        <p className="mt-4 text-base text-zinc-400">
          Join thousands of creators and developers shipping better AI output,
          faster.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
        >
          Get Started Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
