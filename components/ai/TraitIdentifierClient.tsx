"use client";

import { FormEvent, useState } from "react";

type Candidate = {
  slug?: string;
  name: string;
  score: number;
  reasoning: string;
};

export function TraitIdentifierClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai/trait-identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Trait identifier request failed.");
      }

      setResults(json.candidates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trait identifier request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-6">
        <div className="grid gap-4">
          {[
            { name: "gramStain", label: "Gram stain", options: ["positive", "negative", "unknown"] },
            { name: "morphology", label: "Cell morphology", options: ["cocci", "bacilli", "spirochete", "coccobacilli", "vibrio", "filamentous", "unknown"] },
            { name: "oxygenRequirement", label: "Oxygen requirement", options: ["aerobic", "anaerobic", "facultative", "unknown"] },
            { name: "motility", label: "Motility", options: ["yes", "no", "unknown"] },
            { name: "sporeForming", label: "Spore forming", options: ["yes", "no", "unknown"] },
            { name: "habitat", label: "Habitat / source", options: ["soil", "water", "human", "animal", "food", "unknown"] }
          ].map((field) => (
            <label key={field.name} className="space-y-2">
              <span className="text-sm text-slate-200">{field.label}</span>
              <select name={field.name} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Disease if any</span>
            <input name="disease" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Any other known characteristic</span>
            <textarea
              name="other"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            />
          </label>
          <button type="submit" disabled={loading} className="rounded-2xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm text-cyan">
            {loading ? "Analyzing..." : "Identify candidates"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="rounded-[2rem] border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
          AI results are educational, not clinical.
        </div>
        {error ? <div className="rounded-[2rem] border border-pathogen/30 bg-pathogen/10 p-4 text-sm text-pathogen">{error}</div> : null}
        {results.length ? (
          results.map((candidate, index) => (
            <div key={`${candidate.name}-${index}`} className="glass-panel rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-[var(--font-display)] text-2xl text-white">{candidate.name}</p>
                  <p className="mt-2 text-sm text-slate-300">{candidate.reasoning}</p>
                </div>
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                  Match {candidate.score}%
                </span>
              </div>
              {candidate.slug ? (
                <a href={`/microbe/${candidate.slug}`} className="mt-4 inline-flex text-sm text-cyan hover:underline">
                  View full profile
                </a>
              ) : null}
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-300">
            Submit observed traits to receive ranked candidate microbes with reasoning.
          </div>
        )}
      </div>
    </div>
  );
}

