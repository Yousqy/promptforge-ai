import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
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
    return Response.json({ plan: "FREE", authenticated: false });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { plan: true, compilationCount: true, compilationResetAt: true },
  });

  if (!dbUser) {
    return Response.json({ plan: "FREE", authenticated: true, compilationCount: 0, limit: 10, resetsAt: null });
  }

  return Response.json({
    plan: dbUser.plan,
    authenticated: true,
    compilationCount: dbUser.compilationCount,
    limit: dbUser.plan === "FREE" ? 10 : null,
    resetsAt: dbUser.compilationResetAt,
  });
}
