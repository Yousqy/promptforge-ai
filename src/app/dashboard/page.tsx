import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/supabase";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plan = "FREE";
  let userName = "User";
  let email = "";

  if (user) {
    email = user.email || "";
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { plan: true, name: true },
    });
    if (dbUser) {
      plan = dbUser.plan;
      userName = dbUser.name || user.email?.split("@")[0] || "User";
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">PromptForge</span>
          <span className="inline-flex items-center rounded-md border border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[10px] font-medium text-accent">
            AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-muted leading-none">{userName}</p>
            <p className="text-[10px] text-muted/60 leading-none mt-0.5">{email}</p>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              plan === "PRO"
                ? "bg-accent/15 text-accent border border-accent/30"
                : plan === "ENTERPRISE"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "bg-background text-muted border border-border"
            }`}
          >
            {plan === "Hobby" && (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                <path d="M20 3v4"/><path d="M22 5h-4"/>
              </svg>
            )}
            {plan === "PRO" && (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
              </svg>
            )}
            {plan === "ENTERPRISE" && (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
              </svg>
            )}
            {plan}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Workspace */}
      <DashboardClient plan={plan} />
    </div>
  );
}
