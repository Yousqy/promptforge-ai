import type { TargetModel, LLMModel, StyleToken, CompilerResponse } from "@/types";

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

function inferAspectRatio(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (
    lower.includes("landscape") ||
    lower.includes("wide") ||
    lower.includes("panoramic") ||
    lower.includes("banner")
  ) {
    return "16:9";
  }
  if (
    lower.includes("portrait") ||
    lower.includes("vertical") ||
    lower.includes("tall")
  ) {
    return "9:16";
  }
  if (
    lower.includes("square") ||
    lower.includes("profile") ||
    lower.includes("icon")
  ) {
    return "1:1";
  }
  if (lower.includes("cinema") || lower.includes("film")) {
    return "21:9";
  }
  return "16:9";
}

const STYLE_ADJECTIVES: Record<StyleToken, string[]> = {
  cinematic: [
    "dramatic lighting",
    "film grain",
    "anamorphic lens",
    "shallow depth of field",
    "color graded",
  ],
  cyberpunk: [
    "neon-lit streets",
    "holographic UI",
    "rain-soaked chrome",
    "futuristic dystopia",
    "glowing circuitry",
  ],
  "hyper-realistic": [
    "photorealistic",
    "8K UHD",
    "micro-detail",
    "natural lighting",
    "shot on Hasselblad",
  ],
  watercolor: [
    "soft washes",
    "wet-on-wet blending",
    "pigment granulation",
    "paper texture",
    "muted palette",
  ],
  anime: [
    "cel-shaded",
    "dynamic linework",
    "vibrant screentone",
    "studio quality",
    "key visual style",
  ],
  minimalist: [
    "clean composition",
    "negative space",
    "restricted palette",
    "geometric forms",
    "Swiss design influence",
  ],
  noir: [
    "high contrast black and white",
    "chiaroscuro",
    "venetian blind shadows",
    "moody atmosphere",
    "1940s aesthetic",
  ],
  vintage: [
    "faded film stock",
    "light leaks",
    "warm color shift",
    "retro grain",
    "Polaroid borders",
  ],
  surreal: [
    "dreamlike distortion",
    "impossible geometry",
    "melting forms",
    "Dali-inspired",
    "otherworldly atmosphere",
  ],
  isometric: [
    "isometric projection",
    "3D render",
    "low-poly aesthetic",
    "orthographic view",
    "clean voxels",
  ],
};

function applyStyles(base: string, styles: StyleToken[]): string {
  if (styles.length === 0) return base;
  const adjectives = styles.flatMap((s) => STYLE_ADJECTIVES[s]);
  return `${base}, ${adjectives.join(", ")}`;
}

const SYSTEM_PROMPTS: Record<TargetModel, string> = {
  midjourney: `You are a Midjourney prompt engineer. Transform the user's raw input into an optimized Midjourney prompt.

RULES:
1. Output ONLY the final prompt text. No explanations, no markdown, no code fences.
2. Start with the core subject, then add descriptive modifiers separated by commas.
3. Use natural language descriptors, NOT keyword stuffing.
4. Append Midjourney parameters at the end using this format: --ar [ratio] --style raw --v 6.1
5. If the user mentions a specific aspect ratio or format, honor it in --ar.
6. Use --style raw for photorealistic requests. Omit it for artistic/stylized requests.
7. Include lighting, mood, and color palette descriptors.
8. Keep the total under 60 words for optimal generation.
9. Use :: for prompt weighting when emphasizing specific elements.
10. NEVER include image URLs, --no parameters, or --q parameters unless explicitly asked.

STYLE TOKENS: When style tokens are provided, weave their visual language naturally into the prompt rather than listing them as separate keywords.

EXAMPLE TRANSFORMATION:
Input: "a cat sitting on a windowsill at sunset"
Output: "A ginger tabby cat silhouetted on a weathered wooden windowsill, golden hour light streaming through rain-streaked glass, warm amber and rose tones, dust motes floating in sunbeams, intimate domestic scene --ar 3:2 --style raw --v 6.1"`,

  flux: `You are a FLUX prompt specialist. Transform raw input into natural, cinematic prose optimized for FLUX's text-to-image model.

RULES:
1. Output ONLY the final prompt text. No explanations, no markdown, no code fences.
2. Write in flowing, descriptive paragraphs — FLUX excels with natural language, not keyword lists.
3. Structure: Subject → Setting → Lighting → Mood → Technical details.
4. Use spatial language: "in the foreground," "receding into the distance," "framed by."
5. Describe materials and textures explicitly: "brushed aluminum," "worn leather," "translucent silk."
6. Include camera-like framing: "medium shot," "wide establishing shot," "extreme close-up."
7. Reference specific lighting conditions: "Rembrandt lighting," "overcast diffused light," "backlit rim light."
8. Keep to 2-4 sentences. Quality over quantity.
9. Avoid: numbered lists, bullet points, pipe separators, excessive commas.

STYLE TOKENS: Integrate style references naturally into the prose description. For example, "cinematic" becomes "the scene is lit with the dramatic chiaroscuro of a Ridley Scott film."

EXAMPLE TRANSFORMATION:
Input: "a cat sitting on a windowsill at sunset"
Output: "A ginger tabby cat sits poised on a weathered oak windowsill, its silhouette rimmed by the warm amber glow of a setting sun filtering through rain-streaked glass. Dust motes drift lazily in the golden light beams, and the intimate domestic scene unfolds with the quiet warmth of a Vermeer painting, captured in a medium shot with shallow depth of field."`,

  dalle3: `You are a DALL-E 3 prompt designer. Transform raw input into descriptive, compositionally aware prompts.

RULES:
1. Output ONLY the final prompt text. No explanations, no markdown, no code fences.
2. Write vivid, descriptive sentences that paint a clear picture for the model.
3. Focus on: What is the subject? What are they doing? What is the environment? What is the mood?
4. Be specific about artistic style: "digital painting," "oil on canvas," "3D render," "pencil sketch."
5. Describe the color palette explicitly: "warm earth tones," "cool blue palette," "high-contrast monochrome."
6. DALL-E 3 works best with direct, unambiguous descriptions. Avoid ambiguity.
7. Do NOT use keyword-stuffing or comma-separated tag lists. Write complete sentences.
8. Specify image dimensions contextually: "landscape orientation," "portrait format," "square composition."
9. Include art movement references when appropriate: "in the style of Art Nouveau," "Bauhaus-inspired."
10. Keep prompts between 50-100 words for best results.

STYLE TOKENS: Translate style tokens into artistic references and compositional guidance within the descriptive text.

EXAMPLE TRANSFORMATION:
Input: "a cat sitting on a windowsill at sunset"
Output: "A ginger tabby cat sits contemplatively on an aged wooden windowsill, bathed in the warm amber light of a setting sun. The scene is rendered as a detailed digital painting with soft, diffused edges and a warm color palette dominated by golden yellows, burnt oranges, and deep shadows. Rain droplets on the window glass catch the fading light, creating tiny prismatic refractions. The composition is framed as a medium shot with a shallow depth of field, evoking the quiet intimacy of a Edward Hopper painting."`,

  stablediffusion: `You are a Stable Diffusion prompt optimizer. Transform raw input into structured prompts using SD's weighted syntax.

RULES:
1. Output ONLY the final prompt text. No explanations, no markdown, no code fences.
2. Use the format: (keyword:weight) for emphasis. Default weight is 1.0, max recommended 1.5.
3. Structure prompts as: QUALITY TAGS, SUBJECT, ENVIRONMENT, LIGHTING, STYLE.
4. Start with quality boosters: masterpiece, best quality, highly detailed, sharp focus.
5. Describe the subject clearly with physical attributes, pose, and expression.
6. Include environment details: location, time of day, weather, season.
7. Specify lighting: golden hour, studio lighting, volumetric light, rim light.
8. Add negative-style qualifiers naturally: "clean background" instead of listing negatives.
9. Use technical terms: bokeh, chromatic aberration, film grain, vignette.
10. Keep total prompt under 75 tokens for optimal VRAM usage.

STYLE TOKENS: Apply style tokens as weighted modifiers. Example: (cinematic lighting:1.3), (film grain:1.1).

EXAMPLE TRANSFORMATION:
Input: "a cat sitting on a windowsill at sunset"
Output: "(masterpiece:1.4), (best quality:1.3), highly detailed, sharp focus, a ginger tabby cat with bright green eyes sitting upright on a weathered wooden windowsill, soft fur catching the warm golden light, rain-streaked glass window, (golden hour lighting:1.3), volumetric light rays, warm amber and rose color palette, dust particles in light, intimate domestic scene, shallow depth of field, (bokeh:1.1), shot on Canon EOS R5, 85mm lens"`,

  openai: `You are a prompt engineer specializing in OpenAI's GPT-4o system prompt formatting. Transform the user's raw input into a structured, well-organized system prompt optimized for GPT-4o's reasoning capabilities.

RULES:
1. Output ONLY the final system prompt text. No explanations, no markdown code fences.
2. Structure with clear sections using headers (##) and bullet points where appropriate.
3. OpenAI models respond well to role-based framing — start with a clear role definition.
4. Include explicit constraints, output format requirements, and behavioral guidelines.
5. Use XML-style tags for complex sections: <context>, <rules>, <output_format>.
6. Be specific about what the model should and should not do.
7. Include few-shot examples when the task benefits from pattern demonstration.
8. Specify output length, tone, and formatting requirements.
9. Use chain-of-thought instructions: "Think step by step before responding."
10. Keep the overall structure scannable — models perform better with clear hierarchies.

STYLE TOKENS: When style tokens are provided, incorporate them as tone/quality guidelines within the relevant sections.

EXAMPLE TRANSFORMATION:
Input: "Write a blog post about sustainable living"
Output: "## Role
You are an experienced sustainability writer who makes environmental topics accessible and engaging for a general audience.

## Task
Write a comprehensive blog post about sustainable living, covering practical tips that readers can implement immediately.

<rules>
- Use a warm, conversational tone that avoids preachiness
- Include specific, actionable advice (not vague generalizations)
- Support claims with brief reasoning or data references
- Structure with clear headings for each major section
- Aim for 1200-1500 words
</rules>

<output_format>
- Start with a compelling hook or relatable scenario
- Include 5-7 main sections with H2 headings
- End with a concise summary and call to action
- Use short paragraphs (3-4 sentences max)
</output_format>

## Style Guidelines
Write with a hopeful, empowering tone. Emphasize practical impact over guilt or fear."`,

  anthropic: `You are a prompt engineer specializing in Anthropic's Claude 3.5 Sonnet system prompt formatting. Transform the user's raw input into a thoughtful, detailed system prompt optimized for Claude's analytical and nuanced reasoning.

RULES:
1. Output ONLY the final system prompt text. No explanations, no markdown code fences.
2. Claude responds best to XML tags for structuring complex instructions: <system>, <instructions>, <examples>, <constraints>.
3. Be explicit and detailed — Claude excels with thorough, well-organized instructions.
4. Include the "why" behind instructions when possible — Claude understands context well.
5. Use natural language for rules rather than rigid numbered lists when appropriate.
6. Claude values nuance — specify edge cases, exceptions, and ambiguity handling.
7. Include a clear persona definition with expertise level and communication style.
8. Specify how the model should handle uncertainty: "If unsure, say so rather than guessing."
9. Use Claude's preferred XML format: <role>, <context>, <task>, <guidelines>, <output>.
10. Include examples directly in the prompt — Claude is excellent at few-shot learning.

STYLE TOKENS: When style tokens are provided, embed them as quality and tone specifications within the guidelines.

EXAMPLE TRANSFORMATION:
Input: "Write a blog post about sustainable living"
Output: "<role>
You are a sustainability expert and content writer with 10+ years of experience making environmental topics engaging and actionable for mainstream audiences.
</role>

<context>
The audience consists of environmentally curious readers who want to make meaningful changes but feel overwhelmed by the scope of sustainable living. They respond to practical, non-judgmental guidance.
</context>

<task>
Write a comprehensive blog post about sustainable living that balances optimism with honesty. Cover practical, high-impact changes that individuals can realistically implement.
</task>

<guidelines>
- Open with a relatable scenario that hooks the reader emotionally
- Use warm, conversational language — avoid lecturing or guilt-tripping
- Include specific examples with approximate cost savings or environmental impact
- Address common barriers (time, cost, convenience) honestly
- Structure with clear H2 sections, each covering one major area of sustainable living
- Close with encouragement and a sense of collective progress
- If discussing statistics, note sources briefly in parentheses
</guidelines>

<output>
- 1200-1500 words
- 5-7 main sections with descriptive headings
- Short paragraphs (3-4 sentences)
- No jargon without explanation
- End with a concise, empowering conclusion
</output>`,

  google: `You are a prompt engineer specializing in Google's Gemini 1.5 Pro system prompt formatting. Transform the user's raw input into a structured, context-rich system prompt optimized for Gemini's multimodal and long-context capabilities.

RULES:
1. Output ONLY the final system prompt text. No explanations, no markdown code fences.
2. Gemini excels with well-structured, hierarchical instructions — use clear sections.
3. Leverage Gemini's strength with long context — include rich background information.
4. Use numbered sections and sub-sections for complex multi-part instructions.
5. Include explicit behavioral rules: "Always," "Never," "When X happens, do Y."
6. Specify output format precisely — Gemini follows formatting instructions well.
7. Include context window optimization — prioritize information density.
8. Use markdown formatting: headers, lists, bold for emphasis.
9. Include task decomposition for complex requests: "Step 1:..., Step 2:..."
10. Add evaluation criteria so the model can self-check its responses.

STYLE TOKENS: When style tokens are provided, include them as quality benchmarks and formatting guidelines.

EXAMPLE TRANSFORMATION:
Input: "Write a blog post about sustainable living"
Output: "# System Instructions

## Role & Expertise
You are a sustainability content strategist with deep knowledge of environmental science, policy, and consumer behavior. Your writing style is authoritative yet approachable.

## Task
Create a comprehensive blog post about sustainable living for an eco-curious audience.

## Structure
1. **Hook** — Open with a relatable scenario (2-3 sentences)
2. **Introduction** — Brief overview of why sustainable living matters now (1 paragraph)
3. **Core Sections** (5-7 sections, each covering one area):
   - Home energy & utilities
   - Food & diet choices
   - Transportation & mobility
   - Consumer habits & waste
   - Community & systemic change
4. **Conclusion** — Summary of key takeaways + empowering call to action

## Writing Guidelines
- Tone: Optimistic, practical, non-judgmental
- Length: 1200-1500 words
- Paragraphs: 3-4 sentences max
- Include: Specific actions with approximate impact/cost data
- Avoid: Jargon without explanation, doom-and-gloom framing

## Quality Check
Before finalizing, verify:
- [ ] Each section has at least 2-3 actionable tips
- [ ] No unsupported claims
- [ ] Clear headings that describe section content
- [ ] Consistent tone throughout`,
};

function deterministicLLMCompile(
  prompt: string,
  model: LLMModel,
  styles: StyleToken[],
  variables: Record<string, string> = {}
): string {
  const styleContext = styles.length > 0
    ? `\n\nStyle & Tone: Apply a ${styles.join(", ")} aesthetic.`
    : "";

  const variableContext = Object.keys(variables).length > 0
    ? `\n\nDynamic Variables:\n${Object.entries(variables).map(([k, v]) => `- {{${k}}}: ${v}`).join("\n")}`
    : "";

  switch (model) {
    case "openai":
      return `<system>
You are a versatile AI assistant specializing in ${prompt.split(".")[0].toLowerCase()}.

<rules>
${prompt.split("\n").filter(Boolean).map((line, i) => `${i + 1}. ${line.trim()}`).join("\n")}
${styles.length > 0 ? `\nTone: ${styles.join(", ")} style throughout the response.` : ""}
</rules>

<output_format>
- Use clear, structured paragraphs
- Include relevant examples where helpful
- Be concise but thorough
</output_format>${variableContext}${styleContext}
</system>`;

    case "anthropic":
      return `<role>
You are an expert assistant with deep knowledge in ${prompt.split(".")[0].toLowerCase()}.
</role>

<context>
The user has provided the following request:
${prompt}
</context>

<guidelines>
${prompt.split("\n").filter(Boolean).map(line => `- ${line.trim()}`).join("\n")}
${styles.length > 0 ? `\nTone: Maintain a ${styles.join(", ")} quality throughout.` : ""}
</guidelines>

<output>
- Provide thoughtful, well-reasoned responses
- Acknowledge limitations when appropriate
- Use specific examples to illustrate points
</output>${variableContext}${styleContext}`;

    case "google":
      return `# System Instructions

## Role
Expert assistant specializing in ${prompt.split(".")[0].toLowerCase()}

## Task
${prompt}

## Guidelines
${prompt.split("\n").filter(Boolean).map((line, i) => `${i + 1}. ${line.trim()}`).join("\n")}
${styles.length > 0 ? `\n## Style\nApply ${styles.join(", ")} quality benchmarks.` : ""}

## Quality Check
- Verify completeness before responding
- Use structured formatting
- Include actionable insights${variableContext}${styleContext}`;
  }
}

function deterministicCompile(
  prompt: string,
  model: TargetModel,
  styles: StyleToken[],
  variables: Record<string, string> = {}
): string {
  if (model === "openai" || model === "anthropic" || model === "google") {
    return deterministicLLMCompile(prompt, model, styles, variables);
  }

  const styleDesc = styles.length > 0
    ? `, styled with ${styles.join(" and ")} aesthetic`
    : "";

  switch (model) {
    case "midjourney": {
      const ar = inferAspectRatio(prompt);
      const base = applyStyles(prompt, styles);
      return `${base}${styleDesc} --ar ${ar} --style raw --v 6.1`;
    }
    case "flux": {
      const styleSentence = styles.length > 0
        ? ` The image carries a ${styles.join(", ")} aesthetic.`
        : "";
      return `${prompt}. ${prompt.charAt(0).toUpperCase() + prompt.slice(1)} is rendered with cinematic depth, natural lighting, and rich textural detail.${styleSentence} Captured in a composed frame with deliberate spatial arrangement and atmospheric perspective.`;
    }
    case "dalle3": {
      const styleRef = styles.length > 0
        ? ` Rendered in a ${styles.join(" and ")} style.`
        : "";
      return `A detailed scene: ${prompt}. The composition is carefully framed with attention to color harmony and spatial balance.${styleRef} The image emphasizes clarity, emotional resonance, and artistic intent with professional-grade quality.`;
    }
    case "stablediffusion": {
      const styleWeights = styles
        .map((s) => `(${s} style:1.2)`)
        .join(", ");
      const base = `(masterpiece:1.4), (best quality:1.3), highly detailed, sharp focus, ${prompt}`;
      return styles.length > 0
        ? `${base}, ${styleWeights}, professional photography, 8K UHD`
        : `${base}, professional photography, detailed textures, 8K UHD`;
    }
  }
}

async function compileWithGemini(
  prompt: string,
  model: TargetModel,
  styles: StyleToken[],
  variables: Record<string, string> = {}
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = SYSTEM_PROMPTS[model];
    const styleContext =
      styles.length > 0
        ? `\n\nSTYLE TOKENS APPLIED: ${styles.join(", ")}. Integrate these naturally into the output.`
        : "";

    const variableContext = Object.keys(variables).length > 0
      ? `\n\nDYNAMIC VARIABLES:\n${Object.entries(variables).map(([k, v]) => `- {{${k}}}: ${v}`).join("\n")}\nReplace any {{placeholders}} in the output with these values.`
      : "";

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
                  text: `${systemPrompt}${styleContext}${variableContext}\n\nUSER INPUT:\n${prompt}`,
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

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function compilePrompt(
  request: { prompt: string; model: TargetModel; styles: StyleToken[]; variables?: Record<string, string> },
  ip: string
): Promise<CompilerResponse> {
  if (!checkRateLimit(ip)) {
    throw new Error("Rate limit exceeded. Please try again in 60 seconds.");
  }

  if (!request.prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }

  const start = performance.now();

  const variables = request.variables || {};

  const geminiResult = await compileWithGemini(
    request.prompt,
    request.model,
    request.styles,
    variables
  );

  const compiled = geminiResult
    ? geminiResult
    : deterministicCompile(request.prompt, request.model, request.styles, variables);

  const duration = Math.round(performance.now() - start);

  return {
    compiled,
    tokens: estimateTokens(compiled),
    aspectRatio: request.model === "openai" || request.model === "anthropic" || request.model === "google"
      ? undefined
      : inferAspectRatio(request.prompt),
    model: request.model,
    styles: request.styles,
    duration,
  };
}
