import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
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
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Vision API is not configured. Please add a GOOGLE_AI_KEY." },
      { status: 503 }
    );
  }

  const body = await request.json();

  if (!body.image || typeof body.image !== "string") {
    return Response.json({ error: "Image data is required" }, { status: 400 });
  }

  const dataUrlMatch = body.image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!dataUrlMatch) {
    return Response.json(
      { error: "Invalid image format. Expected a base64 data URL." },
      { status: 400 }
    );
  }

  const mimeType = dataUrlMatch[1];
  const base64Data = dataUrlMatch[2];

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(mimeType)) {
    return Response.json(
      { error: `Unsupported image type: ${mimeType}. Allowed: JPEG, PNG, WebP, GIF.` },
      { status: 400 }
    );
  }

  const sizeBytes = Math.ceil((base64Data.length * 3) / 4);
  if (sizeBytes > MAX_SIZE) {
    return Response.json(
      { error: `Image too large. Maximum size is ${MAX_SIZE / (1024 * 1024)}MB.` },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: `Analyze this image and provide a highly detailed, professional prompt description that could be used to recreate this image's style, composition, subject matter, lighting, color palette, and mood. 

Focus on:
- Subject and its pose, expression, or action
- Environment and background details
- Lighting direction, quality, and color temperature
- Artistic style or medium (photography, digital art, painting, etc.)
- Color palette and tonal qualities
- Camera angle, framing, and depth of field
- Mood and atmosphere

Output ONLY the prompt description text. No preamble, no "Here's a prompt:", no markdown formatting. Just the description itself.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const msg =
        errData?.error?.message ?? `Gemini API error (${response.status})`;
      return Response.json({ error: msg }, { status: 502 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return Response.json(
        { error: "Could not generate a description from this image." },
        { status: 422 }
      );
    }

    return Response.json({ prompt: text });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Vision analysis failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
