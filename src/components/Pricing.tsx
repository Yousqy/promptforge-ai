"use client";

import { useState } from "react";
import { Check, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying out PromptForge",
    features: [
      "50 prompt compilations / month",
      "All 4 AI models",
      "5 style tokens",
      "Basic prompt history",
    ],
    cta: "Get Started",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals who need more power",
    features: [
      "Unlimited compilations",
      "All 4 AI models",
      "All 10 style tokens",
      "Advanced prompt history",
      "Custom brand styles",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For Large Scale Corporations",
    features: [
      "Everything in Pro",
      "5 team members included",
      "Shared workspace",
      "Version control & branching",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Us",
    href: "mailto:horaifchi@gmail.com?subject=PromptForge%20AI%20-%20Enterprise%20Inquiry",
    highlighted: false,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading("Pro");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="relative px-6 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
            <Zap className="h-3 w-3" />
            Simple Pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start free, scale as you grow
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-muted">
            No hidden fees. Upgrade or downgrade anytime. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.highlighted
                  ? "border border-orange-500/30 shadow-2xl shadow-orange-500/5 bg-card"
                  : "border-border bg-card hover:border-border-hover"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold font-sans tracking-wide text-zinc-950">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.highlighted ? (
                <button
                  onClick={handleCheckout}
                  disabled={loading !== null}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === "Pro" ? "Redirecting..." : plan.cta}
                  {loading !== "Pro" && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className="group flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted transition-all hover:border-border-hover hover:text-foreground"
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
