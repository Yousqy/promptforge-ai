import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/supabase";

const FREE_MONTHLY_LIMIT = 10;

export interface LimitCheckResult {
  allowed: boolean;
  guest: boolean;
  plan: string;
  compilationCount: number;
  limit: number | null;
  resetsAt: Date | null;
  error?: string;
}

export async function checkCompilationLimit(): Promise<LimitCheckResult> {
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

  if (!user) {
    return {
      allowed: true,
      guest: true,
      plan: "FREE",
      compilationCount: 0,
      limit: null,
      resetsAt: null,
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { plan: true, compilationCount: true, compilationResetAt: true },
  });

  if (!dbUser) {
    return {
      allowed: true,
      guest: true,
      plan: "FREE",
      compilationCount: 0,
      limit: null,
      resetsAt: null,
    };
  }

  const plan = dbUser.plan;

  if (plan === "PRO" || plan === "ENTERPRISE") {
    return {
      allowed: true,
      guest: false,
      plan,
      compilationCount: dbUser.compilationCount,
      limit: null,
      resetsAt: null,
    };
  }

  const now = new Date();
  const resetAt = dbUser.compilationResetAt;

  if (!resetAt || now > resetAt) {
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        compilationCount: 0,
        compilationResetAt: nextReset,
      },
    });

    return {
      allowed: true,
      guest: false,
      plan,
      compilationCount: 0,
      limit: FREE_MONTHLY_LIMIT,
      resetsAt: nextReset,
    };
  }

  if (dbUser.compilationCount >= FREE_MONTHLY_LIMIT) {
    return {
      allowed: false,
      guest: false,
      plan,
      compilationCount: dbUser.compilationCount,
      limit: FREE_MONTHLY_LIMIT,
      resetsAt: resetAt,
      error: `You've reached your Free tier limit of ${FREE_MONTHLY_LIMIT} compilations this month. Please upgrade to Pro for unlimited compilations.`,
    };
  }

  return {
    allowed: true,
    guest: false,
    plan,
    compilationCount: dbUser.compilationCount,
    limit: FREE_MONTHLY_LIMIT,
    resetsAt: resetAt,
  };
}

export async function incrementCompilationCount(): Promise<void> {
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

  if (!user) return;

  await prisma.user.update({
    where: { email: user.email! },
    data: {
      compilationCount: { increment: 1 },
    },
  });
}
