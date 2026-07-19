"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Loader2,
  ChevronDown,
  AlertCircle,
  Zap,
  Clock,
  Maximize2,
} from "lucide-react";
import type { TargetModel, StyleToken, CompilerResponse } from "@/types";

const MODELS: { value: TargetModel; label: string; icon: string }[] = [
  { value: "midjourney", label: "Midjourney", icon: "MJ" },
  { value: "flux", label: "FLUX", icon: "FX" },
  { value: "dalle3", label: "DALL-E 3", icon: "DE" },
  { value: "stablediffusion", label: "Stable Diffusion", icon: "SD" },
];

const STYLES: { value: StyleToken; label: string }[] = [
  { value: "cinematic", label: "Cinematic" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "hyper-realistic", label: "Hyper-realistic" },
  { value: "watercolor", label: "Watercolor" },
  { value: "anime", label: "Anime" },
  { value: "minimalist", label: "Minimalist" },
  { value: "noir", label: "Noir" },
  { value: "vintage", label: "Vintage" },
  { value: "surreal", label: "Surreal" },
  { value: "isometric", label: "Isometric" },
];

export default function CompilerPlayground() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<TargetModel>("midjourney");
  const [styles, setStyles] = useState<StyleToken[]>([]);
  const [result, setResult] = useState<CompilerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStyle = useCallback((style: StyleToken) => {
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }, []);

  const handleCompile = useCallback(() => {
    if (!prompt.trim()) return;

    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/compiler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), model, styles }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Compilation failed");
          return;
        }

        setResult(data);
      } catch {
        setError("Network error. Please check your connection and try again.");
      }
    });
  }, [prompt, model, styles]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.compiled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCompile();
      }
    },
    [handleCompile]
  );

  const selectedModel = MODELS.find((m) => m.value === model)!;

  return (
    <section id="playground" className="relative px-6 pt-28 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3 w-3" />
            Cross-model prompt compiler
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Write once.
            <br />
            <span className="text-accent">Compile for any model.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            Transform your raw prompts into optimized, model-specific syntax.
            One input, four outputs, zero friction.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="flex flex-col rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Input
              </span>
              <span className="text-xs text-muted font-mono">
                {prompt.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <div className="flex-1 p-4">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your raw prompt or describe what you want to generate..."
                className="min-h-[160px] w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted/50 focus:outline-none font-mono leading-relaxed"
                rows={6}
              />
            </div>

            <div className="border-t border-border p-4 space-y-4">
              {/* Model Selector */}
              <div className="relative" ref={dropdownRef}>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Target Model
                </label>
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-border-hover focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-[10px] font-bold text-accent">
                      {selectedModel.icon}
                    </span>
                    {selectedModel.label}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-xl shadow-black/20 fade-in">
                    {MODELS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          setModel(m.value);
                          setModelDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                          m.value === model
                            ? "bg-accent/10 text-accent"
                            : "text-muted hover:bg-background hover:text-foreground"
                        } first:rounded-t-lg last:rounded-b-lg`}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-[10px] font-bold text-accent">
                          {m.icon}
                        </span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Style Tokens */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Style Tokens
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map((s) => {
                    const active = styles.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => toggleStyle(s.value)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                          active
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "border border-border text-muted hover:border-border-hover hover:text-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compile Button */}
              <button
                type="button"
                onClick={handleCompile}
                disabled={!prompt.trim() || isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/15 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Compile Prompt
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-muted/60">
                Press <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px] font-mono">⌘ Enter</kbd> to compile
              </p>
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`flex flex-col rounded-xl border bg-card transition-all duration-300 ${
              isPending
                ? "border-accent/40 glow-pulse"
                : "border-border"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Output
              </span>
              <div className="flex items-center gap-2">
                {result && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted transition-all hover:border-border-hover hover:text-foreground"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 min-h-[160px]" ref={outputRef}>
              {isPending && (
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-accent/5 shimmer-bg" />
                  <div className="h-4 w-1/2 rounded bg-accent/5 shimmer-bg" />
                  <div className="h-4 w-2/3 rounded bg-accent/5 shimmer-bg" />
                  <div className="h-4 w-1/3 rounded bg-accent/5 shimmer-bg" />
                </div>
              )}

              {!isPending && error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3 fade-in">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {!isPending && !error && !result && (
                <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/5 text-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted">
                    Your compiled prompt will appear here
                  </p>
                  <p className="mt-1 text-xs text-muted/50">
                    Enter a prompt and hit compile
                  </p>
                </div>
              )}

              {!isPending && result && (
                <div className="fade-in">
                  <div className="whitespace-pre-wrap rounded-lg bg-background/50 p-3 font-mono text-sm leading-relaxed text-foreground">
                    {result.compiled}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
                      <Zap className="h-3 w-3 text-accent" />
                      ~{result.tokens} tokens
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
                      <Maximize2 className="h-3 w-3 text-accent" />
                      {result.aspectRatio}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
                      <Clock className="h-3 w-3 text-accent" />
                      {result.duration}ms
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
