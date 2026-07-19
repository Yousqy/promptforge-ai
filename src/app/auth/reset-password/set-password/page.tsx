"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { Anvil, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push("/sign-in"), 3000);
    }
  };

  if (validSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <Lock className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Invalid or expired link
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-500"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Left visual panel */}
      <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center overflow-hidden border-r border-zinc-800/80">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-violet-500/5" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-500/6 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-violet-500/4 blur-2xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 glow-pulse">
            <Anvil className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              PromptForge AI
            </h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-zinc-400">
              Choose a strong new password to secure your account
              and get back to prompt engineering.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Anvil className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              PromptForge
            </span>
            <span className="inline-flex items-center rounded-md border border-violet-500/20 bg-violet-500/5 px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
              AI
            </span>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                Password updated
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your password has been reset. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Set new password
                </h2>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Choose a strong password with at least 6 characters.
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
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-medium text-zinc-400"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-medium text-zinc-400"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-zinc-500">
                <Link
                  href="/sign-in"
                  className="font-medium text-violet-400/80 transition-colors hover:text-violet-400"
                >
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
