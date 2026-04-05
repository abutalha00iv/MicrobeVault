"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { ElementType } from "react";
import { Search, ArrowRight, Dna, Microscope, FlaskConical, AlertTriangle, Shield, RefreshCw, Globe } from "lucide-react";

type FlowchartItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
};

type CategoryMeta = {
  label: string;
  shortLabel: string;
  icon: ElementType;
  accent: string;
  badge: string;
  borderColor: string;
  glow: string;
};

const CATEGORIES: Record<string, CategoryMeta> = {
  gram_staining: {
    label: "Gram Staining Procedure",
    shortLabel: "Gram Staining",
    icon: Microscope,
    accent: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
    borderColor: "#8b5cf6",
    glow: "rgba(139,92,246,0.15)",
  },
  id_algorithm: {
    label: "Identification Algorithm",
    shortLabel: "ID Algorithm",
    icon: Dna,
    accent: "text-blue-400",
    badge: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
    borderColor: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
  },
  metabolic: {
    label: "Metabolic Pathway",
    shortLabel: "Metabolic",
    icon: FlaskConical,
    accent: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
    borderColor: "#10b981",
    glow: "rgba(16,185,129,0.15)",
  },
  infection_pathway: {
    label: "Infection Pathway",
    shortLabel: "Infection",
    icon: AlertTriangle,
    accent: "text-rose-400",
    badge: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
    borderColor: "#f43f5e",
    glow: "rgba(244,63,94,0.15)",
  },
  antibiotic_resistance: {
    label: "Antibiotic Resistance",
    shortLabel: "Resistance",
    icon: Shield,
    accent: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    borderColor: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
  },
  life_cycle: {
    label: "Life Cycle Diagram",
    shortLabel: "Life Cycle",
    icon: RefreshCw,
    accent: "text-cyan",
    badge: "bg-cyan/15 text-cyan border border-cyan/25",
    borderColor: "#00F5D4",
    glow: "rgba(0,245,212,0.15)",
  },
  ecological: {
    label: "Microbiome Ecology",
    shortLabel: "Ecological",
    icon: Globe,
    accent: "text-green-400",
    badge: "bg-green-500/15 text-green-300 border border-green-500/25",
    borderColor: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
  },
};

const ALL = "__all__";

export function FlowchartGrid({ flowcharts }: { flowcharts: FlowchartItem[] }) {
  const [activeCat, setActiveCat] = useState(ALL);
  const [query, setQuery] = useState("");

  const presentCategories = useMemo(
    () => [...new Set(flowcharts.map((f) => f.category))],
    [flowcharts]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return flowcharts.filter((f) => {
      const matchesCat = activeCat === ALL || f.category === activeCat;
      const matchesQuery =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [flowcharts, activeCat, query]);

  return (
    <div className="space-y-8">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search flowcharts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan/40 focus:bg-white/[0.06]"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCat(ALL)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeCat === ALL
                ? "bg-cyan/20 text-cyan border border-cyan/30"
                : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {presentCategories.map((cat) => {
            const meta = CATEGORIES[cat];
            if (!meta) return null;
            const active = activeCat === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(active ? ALL : cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active ? meta.badge : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
                }`}
              >
                {meta.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">
        {filtered.length === flowcharts.length
          ? `${flowcharts.length} diagrams`
          : `${filtered.length} of ${flowcharts.length} diagrams`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-16 text-center">
          <p className="text-slate-400">No flowcharts match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((flowchart) => {
            const meta = CATEGORIES[flowchart.category];
            const Icon = meta?.icon;
            return (
              <Link
                key={flowchart.id}
                href={`/flowchart/${flowchart.slug}`}
                className="group relative overflow-hidden rounded-[2rem] transition-all duration-300 hover:scale-[1.025]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderLeftWidth: "4px",
                  borderLeftColor: meta?.borderColor ?? "#475569",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                  if (meta?.glow) {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${meta.glow}, 0 0 0 1px rgba(255,255,255,0.1)`;
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)";
                }}
              >
                {/* Subtle gradient sheen on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at top left, ${meta?.glow ?? "transparent"} 0%, transparent 60%)`,
                  }}
                />

                <div className="relative p-6">
                  {/* Header row */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    {/* Category badge */}
                    {meta && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.badge}`}>
                        {Icon && <Icon className="h-3 w-3" />}
                        {meta.shortLabel}
                      </span>
                    )}
                    {/* Arrow */}
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-300" />
                  </div>

                  {/* Title */}
                  <h2 className="font-[var(--font-display)] text-xl leading-snug text-white group-hover:text-white">
                    {flowchart.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400 group-hover:text-slate-300">
                    {flowchart.description}
                  </p>

                  {/* Bottom divider line with category color */}
                  <div
                    className="mt-5 h-px w-full opacity-20"
                    style={{
                      background: meta?.glow
                        ? `linear-gradient(90deg, ${meta.glow.replace("0.15", "1")}, transparent)`
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  <p className={`mt-3 text-xs font-medium ${meta?.accent ?? "text-slate-500"}`}>
                    View interactive diagram →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
