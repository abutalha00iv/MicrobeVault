"use client";

import { FormEvent, useState } from "react";

export function NcbiExplorerClient({ isAdmin }: { isAdmin: boolean }) {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/ncbi/fetch?term=${encodeURIComponent(term)}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "NCBI lookup failed.");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NCBI lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  const importRecord = async () => {
    if (!isAdmin) return;
    const response = await fetch("/api/ncbi/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ term, import: true })
    });
    const json = await response.json();
    if (response.ok) {
      setResult((current: any) => ({ ...current, importedId: json.imported.id }));
    } else {
      setError(json.error || "Import failed.");
    }
  };

  return (
    <div className="glass-panel rounded-[2rem] p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan">NCBI explorer</p>
      <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Live taxonomy fetch</h1>
      <form onSubmit={search} className="mt-8 grid gap-4 md:grid-cols-[1fr,auto]">
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          type="search"
          placeholder="Type any microbe name"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        />
        <button type="submit" className="rounded-2xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm text-cyan">
          {loading ? "Fetching..." : "Fetch from NCBI"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-pathogen">{error}</p> : null}

      {result ? (
        <div className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Official taxonomy", result.officialName],
              ["GenBank records", result.genbankCount],
              ["PubMed count", result.pubmedCount],
              ["Taxonomy ID", result.taxonomyId]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-sm text-slate-100">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
            {result.sequenceSummary}
          </div>
          {result.pubmedAbstracts?.map((item: any) => (
            <details key={item.pmid} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <summary className="cursor-pointer text-sm text-white">{item.title}</summary>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.abstract}</p>
            </details>
          ))}
          {isAdmin ? (
            <button type="button" onClick={importRecord} className="rounded-2xl border border-amber/30 bg-amber/10 px-5 py-3 text-sm text-amber">
              Import to MicrobeVault
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

