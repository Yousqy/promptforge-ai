"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase";
import { Anvil, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left visual panel */}
      <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-accent/5" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/6 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-accent/4 blur-2xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 text-accent glow-pulse">
            <Anvil className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              PromptForge AI
            </h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
              Reset your password and get back to building
              optimized prompts for any AI model.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Anvil className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              PromptForge
            </span>
            <span className="inline-flex items-center rounded-md border border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              AI
            </span>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-6">
                We sent a password reset link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Click the link in the email to set a new password.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-accent/80 transition-colors hover:text-accent"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Reset your password
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  Enter the email associated with your account and we&apos;ll send
                  a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-muted"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/15 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-muted">
                Remember your password?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-accent/80 transition-colors hover:text-accent"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
