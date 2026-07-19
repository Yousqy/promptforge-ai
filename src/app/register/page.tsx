"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { Anvil, User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Create Supabase auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      setErrorMessage(authError.message);
      setLoading(false);
      return;
    }

    // 2. Create database records via server action
    if (data.user) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, email, name }),
      });

      if (!res.ok) {
        const body = await res.json();
        setErrorMessage(body.error || "Failed to create account.");
        setLoading(false);
        return;
      }
    }

    // 3. If Supabase auto-confirms, session exists → go to home
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      // Email confirmation required → show success message
      setSuccessMessage("Account created! Check your email to confirm, then sign in.");
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
              Write once, compile for any AI model. The collaborative prompt
              design system for teams.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-left">
            {[
              "Multi-model prompt compilation",
              "Version history & branching",
              "Brand style token system",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-muted">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
                {item}
              </div>
            ))}
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

          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Get started with PromptForge AI
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/15 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign up
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-accent/80 transition-colors hover:text-accent"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
