import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/supabase";

export const runtime = "nodejs";

async function getAuthedUserId(): Promise<string | null> {
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

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  });

  return dbUser?.id ?? null;
}

export async function GET() {
  const userId = await getAuthedUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prompts = await prisma.savedPrompt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      prompt: true,
      models: true,
      variables: true,
      styles: true,
      createdAt: true,
    },
  });

  return Response.json({ prompts });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.prompt || typeof body.prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (!Array.isArray(body.models) || body.models.length === 0) {
    return Response.json({ error: "At least one model is required" }, { status: 400 });
  }

  const saved = await prisma.savedPrompt.create({
    data: {
      prompt: body.prompt,
      models: body.models,
      variables: body.variables && Object.keys(body.variables).length > 0 ? body.variables : null,
      styles: Array.isArray(body.styles) ? body.styles : [],
      userId,
    },
    select: {
      id: true,
      prompt: true,
      models: true,
      variables: true,
      styles: true,
      createdAt: true,
    },
  });

  return Response.json({ saved });
}
