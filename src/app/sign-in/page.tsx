"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { Anvil, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

function getAuthError(searchParams: URLSearchParams): string | null {
  const error = searchParams.get("error");
  if (!error) return null;
  if (error === "auth_failed") return "Google authentication failed. Please try again.";
  return decodeURIComponent(error);
}

function SignInForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    getAuthError(searchParams)
  );

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
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
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Sign in to access your prompt templates and team workspace.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border bg-card accent-accent"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-accent/80 transition-colors hover:text-accent"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/15 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted/60">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card py-2.5 text-sm text-muted transition-all hover:border-border-hover hover:text-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-accent/80 transition-colors hover:text-accent"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>}>
      <SignInForm />
    </Suspense>
  );
}
