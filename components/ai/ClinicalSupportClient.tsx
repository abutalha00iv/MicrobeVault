"use client";

import { FormEvent, useState } from "react";

type PathogenResult = {
  slug?: string;
  diseaseSlug?: string;
  diseaseName?: string;
  name: string;
  confidence: number;
  supportingSymptoms: string[];
  reasoning: string;
  diagnosticWorkup: string[];
};

export function ClinicalSupportClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PathogenResult[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    (payload as Record<string, unknown>).symptoms = formData.getAll("symptoms");
    (payload as Record<string, unknown>).bodySystems = formData.getAll("bodySystems");

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai/clinical-support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Clinical support request failed.");
      }
      setResults(json.pathogens || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clinical support request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-6">
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Patient age group</span>
            <select name="ageGroup" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              <option value="infant">Infant</option>
              <option value="child">Child</option>
              <option value="adult">Adult</option>
              <option value="elderly">Elderly</option>
            </select>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm text-slate-200">Symptoms</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {["fever", "cough", "dyspnea", "rash", "diarrhea", "headache", "dysuria", "lymphadenopathy"].map((symptom) => (
                <label key={symptom} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input type="checkbox" name="symptoms" value={symptom} className="mr-2" />
                  {symptom}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Free-text symptoms</span>
            <textarea name="freeText" rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Duration</span>
            <select name="duration" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              <option value="acute">Acute &lt; 2 weeks</option>
              <option value="subacute">Subacute</option>
              <option value="chronic">Chronic</option>
            </select>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm text-slate-200">Affected body systems</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {["respiratory", "gastrointestinal", "neurological", "skin", "blood", "urinary", "reproductive", "systemic"].map((system) => (
                <label key={system} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input type="checkbox" name="bodySystems" value={system} className="mr-2" />
                  {system}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Relevant exposure history</span>
            <input name="exposureHistory" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Immune status</span>
            <select name="immuneStatus" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              <option value="normal">Normal</option>
              <option value="immunocompromised">Immunocompromised</option>
            </select>
          </label>
          <button type="submit" disabled={loading} className="rounded-2xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm text-cyan">
            {loading ? "Ranking pathogens..." : "Analyze case"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="rounded-[2rem] border border-pathogen/40 bg-pathogen/10 p-4 text-sm text-rose-100">
          This tool is for EDUCATIONAL use only. It is NOT a substitute for clinical diagnosis. Always consult a licensed medical professional.
        </div>
        {error ? <div className="rounded-[2rem] border border-pathogen/30 bg-pathogen/10 p-4 text-sm text-pathogen">{error}</div> : null}
        {results.length ? (
          results.map((result) => (
            <div key={result.name} className="glass-panel rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-[var(--font-display)] text-2xl text-white">{result.name}</p>
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                  {result.confidence}%
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{result.reasoning}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.supportingSymptoms.map((symptom) => (
                  <span key={symptom} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {symptom}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-300">
                Suggested diagnostic workup: {result.diagnosticWorkup.join(", ")}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {result.slug ? (
                  <a href={`/microbe/${result.slug}`} className="text-sm text-cyan hover:underline">
                    View pathogen profile
                  </a>
                ) : null}
                {result.diseaseSlug ? (
                  <a href={`/disease/${result.diseaseSlug}`} className="text-sm text-cyan hover:underline">
                    View disease page
                  </a>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-300">
            Enter symptoms and exposure details to receive a ranked educational pathogen differential.
          </div>
        )}
      </div>
    </div>
  );
}

