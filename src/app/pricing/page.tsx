"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-provider";
import { Sparkles, Zap, Building2 } from "lucide-react";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-violet-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const plans = [
  {
    name: "Hobby",
    icon: Sparkles,
    iconColor: "text-zinc-400",
    iconBg: "bg-zinc-800",
    price: { monthly: "$0", annual: "$0" },
    period: "Free Forever",
    target: "For Solo Developers",
    highlighted: false,
    cta: "Get Started Free",
    href: "/register",
    priceId: null,
    features: [
      { text: "1 Team Workspace", included: true },
      { text: "Up to 3 Saved Prompts", included: true },
      { text: "Basic Multi-Model Compilation", included: true },
      { text: "Rate-Limited Compilations/mo", included: true },
      { text: "Unlimited Prompts", included: false },
      { text: "Brand Style Token System", included: false },
      { text: "Shared API Keys", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    name: "Pro",
    icon: Zap,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    price: { monthly: "$19", annual: "$15" },
    period: "/mo per user",
    target: "For Growing Teams",
    highlighted: true,
    cta: "Upgrade to Pro",
    href: null,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "price_pro_monthly",
    features: [
      { text: "Unlimited Prompts & Version History", included: true },
      { text: "Shared Team Workspace", included: true },
      { text: "Brand Style Token System", included: true },
      { text: "Shared API Keys + Higher Rate Limits", included: true },
      { text: "Priority Support", included: true },
      { text: "SSO & Audit Logs", included: false },
      { text: "Dedicated API Throughput", included: false },
      { text: "24/7 Account Manager", included: false },
    ],
  },
  {
    name: "Enterprise",
    icon: Building2,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    price: { monthly: "Custom", annual: "Custom" },
    period: "Contact Us",
    target: "For Large Scale Corporations",
    highlighted: false,
    cta: "Contact Sales",
    href: "mailto:horaifchi@gmail.com?subject=PromptForge%20AI%20-%20Enterprise%20Plan%20Inquiry",
    priceId: null,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Single Sign-On (SSO)", included: true },
      { text: "Audit Logs & Advanced Permissions", included: true },
      { text: "Dedicated / Unlimited API Throughput", included: true },
      { text: "Custom Brand Token Configurations", included: true },
      { text: "24/7 Dedicated Account Manager", included: true },
      { text: "Custom SLA & Contract Terms", included: true },
      { text: "On-Premise Deployment Options", included: true },
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert(data.error || "Failed to start checkout");
        setLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs font-medium text-violet-400">
              Pricing
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                Plans that scale with your team
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">
              Start building for free. Upgrade when you need more power,
              collaboration, and control.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <span
                className={`text-sm font-medium ${
                  !annual ? "text-white" : "text-zinc-500"
                }`}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  annual ? "bg-violet-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    annual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  annual ? "text-white" : "text-zinc-500"
                }`}
              >
                Annual
              </span>
              {annual && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Save 20%
                </span>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 ${
                  plan.highlighted
                    ? "border-violet-500/40 bg-zinc-900/80 shadow-[0_0_40px_-12px_rgba(139,92,246,0.25)]"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-600/25">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${plan.iconBg}`}>
                      <plan.icon className={`h-4 w-4 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{plan.target}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.period !== "Contact Us" && plan.period !== "Free Forever" && (
                      <span className="text-sm text-zinc-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.period === "Free Forever" && (
                    <p className="mt-1 text-sm text-zinc-500">{plan.period}</p>
                  )}
                  {plan.period === "Contact Us" && (
                    <p className="mt-1 text-sm text-zinc-500">{plan.period}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-zinc-800" />

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-start gap-3 text-sm"
                    >
                      {feature.included ? (
                        <CheckIcon />
                      ) : (
                        <CrossIcon />
                      )}
                      <span
                        className={
                          feature.included ? "text-zinc-300" : "text-zinc-600"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.priceId ? (
                  <button
                    type="button"
                    onClick={() => handleCheckout(plan.priceId!, plan.name)}
                    disabled={loading !== null}
                    className={`group flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-violet-600 text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.98]"
                        : "border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.name ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <svg
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={plan.href?.startsWith("mailto:") ? plan.href : (user ? "/dashboard" : (plan.href ?? "/register"))}
                    className={`group flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-violet-600 text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.98]"
                        : "border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {plan.cta}
                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* FAQ-like footnote */}
          <div className="mt-16 text-center">
            <p className="text-sm text-zinc-500">
              All plans include SSL, 99.9% uptime SLA, and GDPR compliance.{" "}
              <Link
                href="#"
                className="text-violet-400 underline decoration-violet-400/30 underline-offset-4 transition-colors hover:text-violet-300"
              >
                Compare features in detail
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
