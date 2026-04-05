"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

type MicrobeRow = {
  id: string;
  scientificName: string;
  commonName: string;
  updatedAt: Date;
  kingdomLabel: string | null;
};

const KINGDOM_COLORS: Record<string, string> = {
  Bacteria:  "border-cyan/30 bg-cyan/10 text-cyan",
  Fungi:     "border-amber/30 bg-amber/10 text-amber",
  Virus:     "border-pathogen/30 bg-pathogen/10 text-pathogen",
  Archaea:   "border-purple-400/30 bg-purple-400/10 text-purple-300",
  Protozoa:  "border-benefit/30 bg-benefit/10 text-benefit",
  Algae:     "border-sky-400/30 bg-sky-400/10 text-sky-300",
  Prion:     "border-orange-400/30 bg-orange-400/10 text-orange-300"
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function MicrobeListClient({ microbes }: { microbes: MicrobeRow[] }) {
  const [query, setQuery] = useState("");
  const [kingdom, setKingdom] = useState("All");

  const kingdoms = useMemo(() => {
    const unique = [...new Set(microbes.map((m) => m.kingdomLabel).filter(Boolean))] as string[];
    return ["All", ...unique.sort()];
  }, [microbes]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return microbes.filter((m) => {
      const matchKingdom = kingdom === "All" || m.kingdomLabel === kingdom;
      const matchQuery =
        !q ||
        m.scientificName.toLowerCase().includes(q) ||
        (m.commonName || "").toLowerCase().includes(q);
      return matchKingdom && matchQuery;
    });
  }, [microbes, query, kingdom]);

  return (
    <div className="space-y-5">
      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-cyan/30 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {kingdoms.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKingdom(k)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                kingdom === k
                  ? "border-cyan/30 bg-cyan/10 text-cyan"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">
        {filtered.length} of {microbes.length} microbe{microbes.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      <div className="glass-panel rounded-[2rem] p-4">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No microbes match your search.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((microbe) => {
              const kClass = KINGDOM_COLORS[microbe.kingdomLabel ?? ""] ?? "border-white/10 bg-white/5 text-slate-300";
              return (
                <Link
                  key={microbe.id}
                  href={`/admin/microbes/${microbe.id}/edit`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5 transition hover:border-cyan/20 hover:bg-white/[0.05]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{microbe.scientificName}</p>
                    <p className="mt-0.5 truncate text-sm text-slate-400">{microbe.commonName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`hidden rounded-full border px-2.5 py-1 text-xs sm:inline ${kClass}`}>
                      {microbe.kingdomLabel ?? "Unknown"}
                    </span>
                    <span className="text-xs text-slate-600">{timeAgo(microbe.updatedAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
