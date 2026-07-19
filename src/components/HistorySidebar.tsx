"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, PanelLeftClose, PanelLeftOpen, Loader2, FileText } from "lucide-react";

interface SavedPromptItem {
  id: string;
  prompt: string;
  models: string[];
  variables: Record<string, string> | null;
  styles: string[];
  createdAt: string;
}

interface HistorySidebarProps {
  onSelect: (item: {
    prompt: string;
    models: string[];
    variables: Record<string, string>;
    styles: string[];
  }) => void;
}

const MODEL_LABELS: Record<string, string> = {
  openai: "OA",
  anthropic: "CL",
  google: "GM",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [items, setItems] = useState<SavedPromptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      if (data.prompts) {
        setItems(
          data.prompts.map((p: SavedPromptItem & { variables: Record<string, string> | null }) => ({
            ...p,
            variables: p.variables ?? null,
          }))
        );
        setFetched(true);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }, [fetched]);

  useEffect(() => {
    if (!collapsed) fetchHistory();
  }, [collapsed, fetchHistory]);

  const handleRefresh = useCallback(() => {
    setFetched(false);
    fetchHistory();
  }, [fetchHistory]);

  const handleSelect = useCallback(
    (item: SavedPromptItem) => {
      onSelect({
        prompt: item.prompt,
        models: item.models,
        variables: (item.variables as Record<string, string>) ?? {},
        styles: item.styles,
      });
    },
    [onSelect]
  );

  return (
    <div
      className={`flex-shrink-0 border-r border-border bg-background/50 transition-all duration-200 ${
        collapsed ? "w-11" : "w-72"
      }`}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-11 w-full items-center justify-center border-b border-border text-muted hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <div className="flex items-center gap-2 w-full px-3">
            <Clock className="h-3.5 w-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-wider flex-1 text-left">
              History
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              className="text-muted/60 hover:text-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
            <PanelLeftClose className="h-3.5 w-3.5 text-muted/60" />
          </div>
        )}
      </button>

      {/* Expanded content */}
      {!collapsed && (
        <div className="flex flex-col h-[calc(100%-44px)] overflow-hidden">
          {loading && items.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-muted/60 animate-spin" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
              <FileText className="h-8 w-8 text-muted/30 mb-2" />
              <p className="text-xs text-muted/50 leading-relaxed">
                No saved prompts yet. Compile once and it will appear here.
              </p>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-border-hover hover:bg-accent/5 transition-all group"
                >
                  <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed font-mono">
                    {item.prompt.slice(0, 120)}
                    {item.prompt.length > 120 ? "..." : ""}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {item.models.map((m) => (
                      <span
                        key={m}
                        className="inline-flex h-4 items-center rounded bg-accent/10 px-1.5 text-[9px] font-bold text-accent/70"
                      >
                        {MODEL_LABELS[m] ?? m.toUpperCase()}
                      </span>
                    ))}
                    {item.styles.length > 0 && (
                      <span className="text-[9px] text-muted/50">
                        +{item.styles.length} style{item.styles.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="ml-auto text-[9px] text-muted/40 font-mono">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
