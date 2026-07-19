export type LLMModel = "openai" | "anthropic" | "google";

export interface CompileResult {
  model: string;
  compiled: string;
  tokens: number;
  duration: number;
}

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

function compileOpenAI(prompt: string, variables: Record<string, string>): string {
  const resolved = replaceVariables(prompt, variables);
  const lines = resolved.split("\n").filter((l) => l.trim());

  const body = lines
    .map((line, i) => {
      const trimmed = line.trim();
      if (/^\d+\./.test(trimmed)) return trimmed;
      if (/^[A-Z]/.test(trimmed) && trimmed.length < 60) return `\n## ${trimmed}`;
      return trimmed;
    })
    .join("\n");

  return `<system>
You are a versatile AI assistant. Follow the instructions below precisely.

<context>
${body}
</context>

<rules>
- Follow every instruction in the context above without exception
- If a constraint is specified, treat it as mandatory
- When unsure, ask for clarification rather than guessing
- Structure responses clearly with headers or bullet points as appropriate
- Match the tone and depth implied by the request
</rules>

<output_format>
- Use structured paragraphs with clear flow
- Include relevant examples where helpful
- Be concise but thorough
- Match the language and register of the original request
</output_format>
</system>`;
}

function compileAnthropic(prompt: string, variables: Record<string, string>): string {
  const resolved = replaceVariables(prompt, variables);
  const lines = resolved.split("\n").filter((l) => l.trim());

  const body = lines
    .map((line) => {
      const trimmed = line.trim();
      if (/^\d+\./.test(trimmed)) return trimmed;
      return `- ${trimmed}`;
    })
    .join("\n");

  return `<role>
You are a thoughtful, precise AI assistant. You follow instructions carefully and acknowledge limitations honestly.
</role>

<context>
The user has provided the following requirements:
${body}
</context>

<guidelines>
- Follow every instruction provided in the context
- Be explicit and thorough in your responses
- When a constraint is stated, honor it completely
- If information is insufficient, say so rather than speculating
- Use natural language alongside structured sections for clarity
- Address edge cases when they are relevant
</guidelines>

<output>
- Provide well-reasoned, structured responses
- Use examples to illustrate key points
- Acknowledge uncertainty when appropriate
- Match the scope and depth of the original request
</output>`;
}

function compileGoogle(prompt: string, variables: Record<string, string>): string {
  const resolved = replaceVariables(prompt, variables);
  const lines = resolved.split("\n").filter((l) => l.trim());

  const body = lines
    .map((line, i) => {
      const trimmed = line.trim();
      if (/^\d+\./.test(trimmed)) return trimmed;
      return `${i + 1}. ${trimmed}`;
    })
    .join("\n");

  return `# System Instructions

## Role
Expert AI assistant with strong adherence to structured instructions.

## Task
${body}

## Behavioral Rules
- Always follow every instruction in the task above exactly as written
- Never skip or reorder steps unless explicitly told to
- When X happens, do Y — handle edge cases predictably
- Verify completeness before responding to any request

## Output Format
- Use markdown headers and numbered lists for structure
- Be specific — include examples, data, or references where relevant
- Prioritize information density without sacrificing clarity
- Include a brief quality check at the end of complex responses

## Quality Check
- [ ] All task requirements addressed
- [ ] No assumptions made without stating them
- [ ] Consistent tone and depth throughout`;
}

const COMPILERS: Record<LLMModel, (prompt: string, variables: Record<string, string>) => string> = {
  openai: compileOpenAI,
  anthropic: compileAnthropic,
  google: compileGoogle,
};

export function compilePromptLocal(
  prompt: string,
  model: LLMModel,
  variables: Record<string, string> = {}
): CompileResult {
  const start = performance.now();

  const compiled = COMPILERS[model](prompt, variables);
  const tokens = estimateTokens(compiled);
  const duration = Math.round(performance.now() - start);

  return { model, compiled, tokens, duration };
}
