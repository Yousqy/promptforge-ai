export type ImageModel = "midjourney" | "flux" | "dalle3" | "stablediffusion";

export type LLMModel = "openai" | "anthropic" | "google";

export type TargetModel = ImageModel | LLMModel;

export type StyleToken =
  | "cinematic"
  | "cyberpunk"
  | "hyper-realistic"
  | "watercolor"
  | "anime"
  | "minimalist"
  | "noir"
  | "vintage"
  | "surreal"
  | "isometric";

export interface CompilerRequest {
  prompt: string;
  model: TargetModel;
  styles: StyleToken[];
  variables?: Record<string, string>;
}

export interface CompilerResponse {
  compiled: string;
  tokens: number;
  aspectRatio?: string;
  model: TargetModel;
  styles: StyleToken[];
  duration: number;
}

export interface CompilerError {
  error: string;
  details?: string;
}
