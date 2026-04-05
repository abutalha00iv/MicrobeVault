"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { SearchSuggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

const groupLabels: Record<string, string> = {
  microbe: "Microbes",
  disease: "Diseases",
  flowchart: "Flowcharts",
  timeline: "Timeline events"
};

export function SearchBar({
  placeholder = "Search microbes, diseases, flowcharts, and timeline events",
  large = false,
  initialQuery = ""
}: {
  placeholder?: string;
  large?: boolean;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();

    if (!trimmed) {
      setSuggestions([]);
      setOpen(false);
      return () => controller.abort();
    }

    const handle = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&mode=suggest`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { suggestions: SearchSuggestion[] };
        setSuggestions(data.suggestions || []);
        setOpen(true);
        setHighlightedIndex(0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query]);

  const grouped = useMemo(() => {
    return suggestions.reduce<Record<string, SearchSuggestion[]>>((acc, suggestion) => {
      acc[suggestion.category] ||= [];
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {});
  }, [suggestions]);

  const flatItems = [...suggestions, { id: "search-all", title: `Search all results for "${query}"`, slug: query, category: "timeline" as const }];

  const navigateToSuggestion = (suggestion: SearchSuggestion | (SearchSuggestion & { id: "search-all" })) => {
    setOpen(false);

    if (suggestion.id === "search-all") {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      return;
    }

    const path =
      suggestion.category === "microbe"
        ? `/microbe/${suggestion.slug}`
        : suggestion.category === "disease"
          ? `/disease/${suggestion.slug}`
          : suggestion.category === "flowchart"
            ? `/flowchart/${suggestion.slug}`
            : `/timeline#event-${suggestion.slug}`;

    router.push(path);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open || flatItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((value) => (value + 1) % flatItems.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((value) => (value - 1 + flatItems.length) % flatItems.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = flatItems[highlightedIndex];
      if (selected) {
        navigateToSuggestion(selected as SearchSuggestion & { id: "search-all" });
      }
    }

    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "glass-panel flex items-center gap-3 rounded-2xl px-5",
          large ? "h-16 text-base" : "h-12 text-sm"
        )}
      >
        <Search className={cn("text-cyan", large ? "h-5 w-5" : "h-4 w-4")} />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(Boolean(suggestions.length))}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-white placeholder:text-slate-400"
          aria-label={placeholder}
        />
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan" /> : null}
      </form>

      {open && query ? (
        <div className="absolute inset-x-0 top-full z-40 mt-3 max-h-[28rem] overflow-y-auto rounded-[1.5rem] border border-cyan/20 bg-slate-950/95 p-3 shadow-2xl">
          {Object.keys(grouped).length ? (
            <>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-3 last:mb-0">
                  <p className="px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">{groupLabels[group]}</p>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const itemIndex = flatItems.findIndex((candidate) => candidate.id === item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToSuggestion(item)}
                          className={cn(
                            "flex w-full items-start justify-between rounded-2xl px-3 py-3 text-left transition",
                            itemIndex === highlightedIndex ? "bg-cyan/10" : "hover:bg-white/5"
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{item.excerpt || item.descriptor}</p>
                          </div>
                          <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan">
                            {groupLabels[item.category].replace(/s$/, "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => navigateToSuggestion(flatItems[flatItems.length - 1] as SearchSuggestion & { id: "search-all" })}
                className={cn(
                  "mt-2 w-full rounded-2xl border border-white/10 px-3 py-3 text-left text-sm text-slate-200",
                  highlightedIndex === flatItems.length - 1 ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                Search all results for "{query}"
              </button>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-slate-300">
              No matches yet. Press Enter to search the full MicrobeVault index.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

