"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Zap,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  FileText,
  Settings2,
  Braces,
  ArrowRightLeft,
  AlertTriangle,
  Infinity,
  Image as ImageIcon,
  Upload,
  Tag,
  Package,
} from "lucide-react";
import { compilePromptLocal, type LLMModel } from "@/lib/compile-engine";
import HistorySidebar from "@/components/HistorySidebar";

interface CompiledOutput {
  model: string;
  compiled: string;
  tokens: number;
  duration: number;
}

interface Variable {
  key: string;
  value: string;
}

interface UsageInfo {
  plan: string;
  compilationCount: number;
  limit: number | null;
  resetsAt: string | null;
}

const LLM_MODELS = [
  {
    id: "openai",
    label: "OpenAI",
    sublabel: "GPT-4o",
    icon: "OA",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    activeBg: "bg-emerald-500/15",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    sublabel: "Claude 3.5 Sonnet",
    icon: "CL",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    activeBg: "bg-orange-500/15",
  },
  {
    id: "google",
    label: "Google",
    sublabel: "Gemini 1.5 Pro",
    icon: "GM",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    activeBg: "bg-blue-500/15",
  },
];

const STYLE_OPTIONS = [
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

const PLACEHOLDER_PROMPT = `You are an expert technical writer. Write a comprehensive guide about {{topic}} that covers:

1. Introduction and context
2. Key concepts and terminology
3. Step-by-step instructions with examples
4. Common pitfalls and how to avoid them
5. Best practices and advanced tips

Target audience: {{audience}}. Tone: {{tone}}.`;

export default function DashboardClient({ plan: initialPlan }: { plan: string }) {
  const [plan, setPlan] = useState(initialPlan);
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["openai"]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [results, setResults] = useState<CompiledOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [showStyles, setShowStyles] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [promptMode, setPromptMode] = useState<"text" | "image">("text");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<{
    titles: string[];
    tags: string[];
    description: string;
  } | null>(null);
  const [exportCopied, setExportCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/plan")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) setPlan(data.plan);
        if (data.authenticated !== false) {
          setUsage({
            plan: data.plan,
            compilationCount: data.compilationCount ?? 0,
            limit: data.limit,
            resetsAt: data.resetsAt,
          });
        }
      })
      .catch(() => {});
  }, []);

  const effectiveTab = activeTab ?? (results.length > 0 ? results[0].model : null);

  const toggleModel = useCallback((id: string) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }, []);

  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }, []);

  const addVariable = useCallback(() => {
    if (newVarKey.trim() && newVarValue.trim()) {
      setVariables((prev) => [...prev, { key: newVarKey.trim(), value: newVarValue.trim() }]);
      setNewVarKey("");
      setNewVarValue("");
    }
  }, [newVarKey, newVarValue]);

  const removeVariable = useCallback((index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const loadTemplate = useCallback(() => {
    setPrompt(PLACEHOLDER_PROMPT);
    setVariables([
      { key: "topic", value: "Rust programming" },
      { key: "audience", value: "intermediate developers" },
      { key: "tone", value: "professional but approachable" },
    ]);
    setSelectedModels(["openai", "anthropic"]);
  }, []);

  const loadFromHistory = useCallback(
    (item: { prompt: string; models: string[]; variables: Record<string, string>; styles: string[] }) => {
      setPrompt(item.prompt);
      setSelectedModels(item.models);
      setSelectedStyles(item.styles);
      setVariables(
        Object.entries(item.variables).map(([key, value]) => ({ key, value }))
      );
      setResults([]);
      setActiveTab(null);
    },
    []
  );

  const analyzeImage = useCallback(
    async (file: File) => {
      setImageError(null);
      setImageAnalyzing(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);

        try {
          const res = await fetch("/api/vision/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });

          const data = await res.json();

          if (!res.ok) {
            setImageError(data.error || "Analysis failed");
            setImageAnalyzing(false);
            return;
          }

          if (data.prompt) {
            setPrompt(data.prompt);
            setPromptMode("text");
            setImagePreview(null);
          }
        } catch {
          setImageError("Network error — try again");
        }
        setImageAnalyzing(false);
      };

      reader.readAsDataURL(file);
    },
    []
  );

  const handleFileDrop = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setImageError("Please upload an image file");
        return;
      }
      analyzeImage(file);
    },
    [analyzeImage]
  );

  const handleCompile = useCallback(async () => {
    if (!prompt.trim() || selectedModels.length === 0 || loading) return;

    setLoading(true);
    setResults([]);
    setActiveTab(null);
    setLimitError(null);

    const variablesObj: Record<string, string> = {};
    variables.forEach((v) => {
      variablesObj[v.key] = v.value;
    });

    const compiledResults: CompiledOutput[] = [];

    for (const modelId of selectedModels) {
      const result = compilePromptLocal(
        prompt.trim(),
        modelId as LLMModel,
        variablesObj
      );
      compiledResults.push({
        model: result.model,
        compiled: result.compiled,
        tokens: result.tokens,
        duration: result.duration,
      });
    }

    setResults(compiledResults);
    if (compiledResults.length > 0) setActiveTab(compiledResults[0].model);
    setLoading(false);

    fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt.trim(),
        models: selectedModels,
        styles: selectedStyles,
        variables: variablesObj,
      }),
    }).catch(() => {});

    fetch("/api/compiler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt.trim(),
        model: selectedModels[0],
        styles: selectedStyles,
        variables: variablesObj,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.limitExceeded) {
          setLimitError(data.error);
          setShowUpgradeModal(true);
        }
        if (data.usage) setUsage(data.usage);
      })
      .catch(() => {});
  }, [prompt, selectedModels, selectedStyles, variables, loading]);

  const handleCopy = useCallback(async (text: string, model: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(model);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const generateProductInfo = useCallback((compiledText: string) => {
    const cleaned = compiledText
      .replace(/<[^>]+>/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const sentences = cleaned.split(/\.\s/).filter((s) => s.trim().length > 10);
    const topicPhrase = sentences[0]?.split(/,/)[0]?.trim() ?? "Custom Design";
    const words = topicPhrase
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 6);

    const titles = [
      `${words.slice(0, 3).join(" ")} — Art Print`,
      `${words.slice(0, 2).join(" ")} Collection`,
      `Premium ${words[0] ?? "Art"} Design`,
      `${topicPhrase.slice(0, 40)}`,
    ];

    const stopWords = new Set([
      "the", "and", "with", "that", "this", "from", "have", "are", "was",
      "for", "been", "into", "also", "like", "using", "than", "your", "more",
    ]);
    const allWords = cleaned
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const freq = new Map<string, number>();
    allWords.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
    const topTags = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([w]) => w);

    const tags = [...new Set([...topTags, "digital art", "print on demand", "wall art", "graphic design"])];

    setExportData({ titles, tags, description: cleaned });
    setShowExportModal(true);
  }, []);

  const handleExportCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setExportCopied(key);
    setTimeout(() => setExportCopied(null), 1500);
  }, []);

  const activeResult = results.find((r) => r.model === effectiveTab);
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  const usagePercent = usage?.limit
    ? Math.min(100, Math.round((usage.compilationCount / usage.limit) * 100))
    : 0;

  return (
    <>
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <HistorySidebar onSelect={loadFromHistory} />
        {/* Left Panel — Configuration */}
        <div className="flex flex-col border-r border-border lg:w-[45%] overflow-y-auto">
          {/* Section: Base Prompt */}
          <div className="border-b border-border">
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                  Base Prompt
                </span>
                <div className="ml-2 flex items-center rounded-lg border border-border bg-background p-0.5">
                  <button
                    type="button"
                    onClick={() => setPromptMode("text")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                      promptMode === "text"
                        ? "bg-accent/15 text-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptMode("image")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                      promptMode === "image"
                        ? "bg-accent/15 text-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <ImageIcon className="h-3 w-3" />
                    Image
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted/60 font-mono">
                  {wordCount} words
                </span>
                <button
                  type="button"
                  onClick={loadTemplate}
                  className="text-[11px] text-accent/80 hover:text-accent transition-colors"
                >
                  Load template
                </button>
              </div>
            </div>

            {promptMode === "text" ? (
              <div className="px-5 pb-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={"Enter your base prompt here...\n\nUse {{variable_name}} syntax for dynamic placeholders.\n\nThe compiler will tailor this prompt for each selected AI model's unique formatting standards."}
                  className="min-h-[220px] w-full resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 font-mono leading-relaxed transition-colors scrollbar-thin"
                />
              </div>
            ) : (
              <div className="px-5 pb-4">
                {imageAnalyzing ? (
                  <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border border-accent/30 bg-accent/5">
                    {imagePreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Uploading"
                        className="mb-4 h-32 w-32 rounded-lg object-cover opacity-60"
                      />
                    )}
                    <Loader2 className="h-5 w-5 animate-spin text-accent mb-2" />
                    <p className="text-xs text-accent/80 font-medium">Analyzing image with Gemini Vision...</p>
                    <p className="text-[10px] text-muted/50 mt-1">Generating a detailed prompt from your image</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 rounded-xl object-contain border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageError(null); }}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileDrop(e.dataTransfer.files); }}
                    className={`flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                      dragOver
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-border-hover hover:bg-accent/5"
                    }`}
                    onClick={() => document.getElementById("image-upload-input")?.click()}
                  >
                    <Upload className={`h-8 w-8 mb-3 transition-colors ${dragOver ? "text-accent" : "text-muted/40"}`} />
                    <p className="text-sm font-medium text-muted">
                      Drop an image here, or <span className="text-accent">browse</span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted/50">
                      JPEG, PNG, WebP, or GIF — max 4MB
                    </p>
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFileDrop(e.target.files)}
                    />
                  </div>
                )}

                {imageError && (
                  <p className="mt-2 text-[11px] text-red-400">{imageError}</p>
                )}

                {!imageAnalyzing && !imagePreview && !imageError && (
                  <p className="mt-2 text-[11px] text-muted/50 text-center">
                    Upload an image and Gemini Vision will reverse-engineer a detailed prompt for you.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section: Usage Meter (FREE only) */}
          {plan === "FREE" && (
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-muted">Monthly usage</span>
                <span className="text-[11px] font-mono text-muted">
                  {usage?.compilationCount ?? 0} / {usage?.limit ?? 10}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 80
                      ? "bg-red-500"
                      : usagePercent >= 50
                      ? "bg-amber-500"
                      : "bg-accent"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usagePercent >= 80 && (
                <p className="mt-1.5 text-[10px] text-amber-400/80">
                  {usage?.limit && usage?.compilationCount !== undefined
                    ? `${usage.limit - usage.compilationCount} compilations remaining this month`
                    : "Approaching limit"}
                </p>
              )}
            </div>
          )}

          {/* Section: Unlimited badge (PRO/ENTERPRISE) */}
          {plan !== "FREE" && (
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Infinity className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] text-accent/80 font-medium">
                  Unlimited compilations
                </span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  plan === "PRO"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}>
                  {plan}
                </span>
              </div>
            </div>
          )}

          {/* Section: Target Models */}
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Target AI Models
              </span>
              <span className="text-[10px] text-muted/60 ml-auto">
                {selectedModels.length} selected
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {LLM_MODELS.map((model) => {
                const active = selectedModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => toggleModel(model.id)}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-all duration-150 ${
                      active
                        ? `${model.activeBg} ${model.borderColor} border shadow-sm`
                        : "border border-border bg-background hover:border-border-hover"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      active ? `${model.bgColor} ${model.color}` : "bg-accent/10 text-muted"
                    }`}>
                      {model.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${active ? "text-foreground" : "text-muted"}`}>
                        {model.label}
                      </p>
                      <p className="text-[11px] text-muted/60">{model.sublabel}</p>
                    </div>
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                      active
                        ? `${model.borderColor} ${model.bgColor}`
                        : "border-border"
                    }`}>
                      {active && (
                        <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={model.color}
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Dynamic Variables */}
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Braces className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Variables
              </span>
              <span className="text-[10px] text-muted/60 ml-auto">
                {variables.length} defined
              </span>
            </div>

            {variables.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {variables.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <span className="text-xs font-mono text-accent/80">
                      {`{{${v.key}}}`}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted/60 shrink-0" />
                    <span className="text-xs text-foreground flex-1 truncate">
                      {v.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariable(i)}
                      className="shrink-0 text-muted/60 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addVariable()}
                placeholder="key"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
              <input
                type="text"
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addVariable()}
                placeholder="value"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
              <button
                type="button"
                onClick={addVariable}
                disabled={!newVarKey.trim() || !newVarValue.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted transition-all hover:border-border-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Section: Style Tokens */}
          <div className="border-b border-border px-5 py-4">
            <button
              type="button"
              onClick={() => setShowStyles(!showStyles)}
              className="flex items-center gap-2 w-full"
            >
              <Settings2 className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Style Tokens
              </span>
              {selectedStyles.length > 0 && (
                <span className="text-[10px] text-accent/80 ml-1">
                  {selectedStyles.length} active
                </span>
              )}
              <ChevronDown className={`h-3 w-3 text-muted/60 ml-auto transition-transform ${showStyles ? "rotate-180" : ""}`} />
            </button>
            {showStyles && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {STYLE_OPTIONS.map((style) => {
                  const active = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all duration-150 ${
                        active
                          ? "bg-accent/15 text-accent border border-accent/30"
                          : "border border-border text-muted hover:border-border-hover hover:text-foreground"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compile Button */}
          <div className="px-5 py-4 mt-auto">
            <button
              type="button"
              onClick={handleCompile}
              disabled={!prompt.trim() || selectedModels.length === 0 || loading}
              className="group flex w-full items-center justify-center gap-2.5 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/15 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compiling for {selectedModels.length} model{selectedModels.length > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Compile & Optimize
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted/60">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted/60">
                {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "⌘" : "Ctrl+"} Enter
              </kbd>{" "}
              to compile
            </p>
          </div>
        </div>

        {/* Right Panel — Compiler Output */}
        <div className="flex flex-col lg:w-[55%] overflow-hidden">
          {/* Output Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Compiled Output
              </span>
            </div>
            {results.length > 0 && (
              <span className="text-[11px] text-muted/60">
                {results.length} compiled in{" "}
                {results.reduce((acc, r) => acc + r.duration, 0)}ms
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex-1 p-5 space-y-4">
              {selectedModels.map((modelId) => {
                const model = LLM_MODELS.find((m) => m.id === modelId);
                return (
                  <div
                    key={modelId}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${model?.bgColor} ${model?.color}`}>
                        {model?.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{model?.label}</p>
                        <p className="text-[10px] text-muted/60">{model?.sublabel}</p>
                      </div>
                      <Loader2 className="h-4 w-4 text-muted/60 animate-spin ml-auto" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-3 w-4/5 rounded bg-accent/5 shimmer-bg" />
                      <div className="h-3 w-3/5 rounded bg-accent/5 shimmer-bg" />
                      <div className="h-3 w-2/3 rounded bg-accent/5 shimmer-bg" />
                      <div className="h-3 w-1/2 rounded bg-accent/5 shimmer-bg" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center px-8">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/5 text-accent">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="text-sm text-muted font-medium">
                Your compiled prompts appear here
              </p>
              <p className="mt-1.5 text-xs text-muted/50 max-w-xs leading-relaxed">
                Enter a base prompt on the left, select target models, and hit compile to see optimized outputs for each AI.
              </p>
              <div className="mt-6 flex items-center gap-6 text-[11px] text-muted/60">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                  OpenAI
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500/40" />
                  Anthropic
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500/40" />
                  Google
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="flex flex-1 flex-col overflow-hidden fade-in">
              {/* Model Tabs */}
              <div className="flex border-b border-border px-2 gap-0.5 overflow-x-auto scrollbar-thin">
                {results.map((result) => {
                  const model = LLM_MODELS.find((m) => m.id === result.model);
                  const isActive = effectiveTab === result.model;
                  return (
                    <button
                      key={result.model}
                      type="button"
                      onClick={() => setActiveTab(result.model)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                        isActive
                          ? `${model?.color} border-current`
                          : "text-muted border-transparent hover:text-foreground"
                      }`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${
                        isActive ? `${model?.bgColor} ${model?.color}` : "bg-accent/10 text-muted/60"
                      }`}>
                        {model?.icon}
                      </span>
                      {model?.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              {activeResult && (
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  <div className="p-5">
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      {/* Output Header */}
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold ${
                            LLM_MODELS.find((m) => m.id === activeResult.model)?.bgColor
                          } ${LLM_MODELS.find((m) => m.id === activeResult.model)?.color}`}>
                            {LLM_MODELS.find((m) => m.id === activeResult.model)?.icon}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              {LLM_MODELS.find((m) => m.id === activeResult.model)?.label} — {LLM_MODELS.find((m) => m.id === activeResult.model)?.sublabel}
                            </p>
                            <p className="text-[10px] text-muted/60">
                              {activeResult.tokens} tokens · {activeResult.duration}ms
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeResult.compiled, activeResult.model)}
                          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted transition-all hover:border-border-hover hover:text-foreground"
                        >
                          {copied === activeResult.model ? (
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
                      </div>

                      {/* Compiled Text */}
                      <div className="p-5">
                        <div className="whitespace-pre-wrap rounded-lg bg-background/50 p-3 font-mono text-sm leading-relaxed text-foreground">
                          {activeResult.compiled}
                        </div>
                        <button
                          type="button"
                          onClick={() => generateProductInfo(activeResult.compiled)}
                          className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted transition-all hover:border-border-hover hover:text-foreground"
                        >
                          <Package className="h-3.5 w-3.5" />
                          Export Product Info
                        </button>
                      </div>
                    </div>

                    {/* Source Preview */}
                    <div className="mt-4 rounded-xl border border-border bg-card p-4">
                      <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">
                        Source Prompt
                      </p>
                      <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted/60">
                        {prompt}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          />
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl shadow-black/50 fade-in">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Compilation limit reached
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-1">
                {limitError || "You've reached your Free tier limit. Please upgrade to Pro for unlimited compilations."}
              </p>
              {usage?.resetsAt && (
                <p className="text-xs text-muted/60 mb-6">
                  Resets on {new Date(usage.resetsAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
              )}
              {!usage?.resetsAt && <div className="mb-6" />}

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/15"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade to Pro
                </Link>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-sm text-muted/60 hover:text-foreground transition-colors py-2"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Product Info Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl shadow-black/50 fade-in max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Package className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Product Info</h3>
                  <p className="text-[10px] text-muted/60">Optimized for print-on-demand listings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
              {/* Title Ideas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">Title Ideas</span>
                </div>
                <div className="space-y-1.5">
                  {exportData.titles.map((title, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 group"
                    >
                      <span className="flex-1 text-xs text-foreground font-mono">{title}</span>
                      <button
                        type="button"
                        onClick={() => handleExportCopy(title, `title-${i}`)}
                        className="shrink-0 text-muted/60 hover:text-foreground transition-colors"
                      >
                        {exportCopied === `title-${i}` ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viral Search Tags */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">Search Tags</span>
                </div>
                <div className="relative">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs font-mono text-foreground/80 leading-relaxed">
                      {exportData.tags.join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCopy(exportData.tags.join(", "), "tags")}
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] text-muted transition-all hover:border-border-hover hover:text-foreground"
                  >
                    {exportCopied === "tags" ? (
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
                </div>
              </div>

              {/* Product Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">Product Description</span>
                </div>
                <div className="relative">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {exportData.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCopy(exportData.description, "desc")}
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] text-muted transition-all hover:border-border-hover hover:text-foreground"
                  >
                    {exportCopied === "desc" ? (
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
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-3 flex items-center justify-between">
              <p className="text-[10px] text-muted/50">
                Tags extracted from compiled output · {exportData.tags.length} keywords
              </p>
              <button
                type="button"
                onClick={() => {
                  const all = [
                    "=== TITLES ===",
                    ...exportData.titles,
                    "",
                    "=== TAGS ===",
                    exportData.tags.join(", "),
                    "",
                    "=== DESCRIPTION ===",
                    exportData.description,
                  ].join("\n");
                  handleExportCopy(all, "all");
                }}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent-glow"
              >
                {exportCopied === "all" ? (
                  <>
                    <Check className="h-3 w-3" />
                    All Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
