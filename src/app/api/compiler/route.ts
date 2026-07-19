import { NextRequest } from "next/server";
import { compilePrompt } from "@/lib/compiler";
import { checkCompilationLimit, incrementCompilationCount } from "./limits";
import type { TargetModel, StyleToken } from "@/types";

export const runtime = "nodejs";

const VALID_MODELS: TargetModel[] = [
  "midjourney",
  "flux",
  "dalle3",
  "stablediffusion",
  "openai",
  "anthropic",
  "google",
];

const VALID_STYLES: StyleToken[] = [
  "cinematic",
  "cyberpunk",
  "hyper-realistic",
  "watercolor",
  "anime",
  "minimalist",
  "noir",
  "vintage",
  "surreal",
  "isometric",
];

export async function POST(request: NextRequest) {
  try {
    const limitCheck = await checkCompilationLimit();

    if (!limitCheck.allowed) {
      const isAuthError = limitCheck.error?.includes("Authentication") || limitCheck.error?.includes("not found");
      return Response.json(
        {
          error: limitCheck.error,
          limitExceeded: !isAuthError,
          authError: isAuthError,
          plan: limitCheck.plan,
          compilationCount: limitCheck.compilationCount,
          limit: limitCheck.limit,
          resetsAt: limitCheck.resetsAt,
        },
        { status: isAuthError ? 401 : 403 }
      );
    }

    const body = await request.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return Response.json(
        { error: "A non-empty prompt string is required." },
        { status: 400 }
      );
    }

    if (!body.model || !VALID_MODELS.includes(body.model)) {
      return Response.json(
        {
          error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const styles: StyleToken[] = Array.isArray(body.styles)
      ? body.styles.filter((s: string) => VALID_STYLES.includes(s as StyleToken))
      : [];

    const variables: Record<string, string> =
      body.variables && typeof body.variables === "object" ? body.variables : {};

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const result = await compilePrompt(
      { prompt: body.prompt, model: body.model, styles, variables },
      ip
    );

    if (!limitCheck.guest) {
      await incrementCompilationCount();
    }

    return Response.json({
      ...result,
      ...(limitCheck.guest
        ? {}
        : {
            usage: {
              plan: limitCheck.plan,
              compilationCount: limitCheck.compilationCount + 1,
              limit: limitCheck.limit,
              resetsAt: limitCheck.resetsAt,
            },
          }),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";

    if (message.includes("Rate limit")) {
      return Response.json({ error: message }, { status: 429 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
