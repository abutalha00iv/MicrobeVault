"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

type NcbiPanelProps = {
  microbeId: string;
  scientificName: string;
  taxonomyId?: number | null;
  initialData?: {
    taxonomyJson?: Record<string, unknown> | null;
    genbankCount?: number | null;
    pubmedCount?: number | null;
    sequenceSummary?: string | null;
    lastFetched?: string | Date | null;
    pubmedAbstracts?: Array<{ pmid: string; title: string; abstract: string }>;
  } | null;
  isAdmin?: boolean;
};

export function NCBIPanel({ microbeId, scientificName, taxonomyId, initialData, isAdmin = false }: NcbiPanelProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/ncbi/fetch?microbeId=${microbeId}&refresh=true`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to refresh NCBI data");
      }
      const json = await response.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh NCBI data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">External data</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">NCBI explorer panel</h2>
          </div>
          <div className="flex gap-2">
            {taxonomyId ? (
              <Link
                href={`https://www.ncbi.nlm.nih.gov/taxonomy/${taxonomyId}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cyan/30 px-4 py-2 text-sm text-cyan hover:bg-cyan/10"
              >
                View on NCBI
              </Link>
            ) : null}
            {isAdmin ? (
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 disabled:opacity-70"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Taxonomy</p>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
              {JSON.stringify(data?.taxonomyJson || { scientificName }, null, 2).slice(0, 240)}...
            </pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">GenBank sequence count</p>
            <p className="mt-3 font-[var(--font-display)] text-4xl text-white">{data?.genbankCount ?? "N/A"}</p>
            <p className="mt-4 text-sm text-slate-300">{data?.sequenceSummary || "Sequence summary unavailable."}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PubMed paper count</p>
            <p className="mt-3 font-[var(--font-display)] text-4xl text-white">{data?.pubmedCount ?? "N/A"}</p>
            <p className="mt-4 text-sm text-slate-300">
              Last fetched: {data?.lastFetched ? new Date(data.lastFetched).toLocaleString() : "Never"}
            </p>
          </div>
        </div>

        {data?.pubmedAbstracts?.length ? (
          <div className="mt-6 space-y-3">
            {data.pubmedAbstracts.slice(0, 3).map((abstract) => (
              <details key={abstract.pmid} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <summary className="cursor-pointer text-sm font-medium text-white">{abstract.title}</summary>
                <p className="mt-3 text-sm leading-7 text-slate-300">{abstract.abstract}</p>
              </details>
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-pathogen">{error}</p> : null}
      </div>
    </section>
  );
}

