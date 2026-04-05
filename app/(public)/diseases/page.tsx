import Link from "next/link";
import { Activity, ArrowRight, ArrowUpDown, ShieldAlert } from "lucide-react";
import { getDiseaseLibraryData } from "@/lib/repository";

export default async function DiseaseLibraryPage({
  searchParams
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const query = searchParams?.q;
  const bodySystem = searchParams?.bodySystem ? [searchParams.bodySystem] : [];
  const severity = searchParams?.severity ? [searchParams.severity] : [];
  const transmissionRoute = searchParams?.transmission ? [searchParams.transmission] : [];
  const microbeType = searchParams?.microbeType ? [searchParams.microbeType] : [];
  const endemic = searchParams?.endemic === "1";
  const epidemic = searchParams?.epidemic === "1";
  const view = searchParams?.view || "grid";

  const diseases = await getDiseaseLibraryData({
    query,
    bodySystem,
    severity,
    transmissionRoute,
    microbeType,
    endemic,
    epidemic
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Disease library</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Human infection database</h1>
        </div>
        <form className="grid gap-3 md:grid-cols-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Disease, ICD-10, symptom keyword"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white md:col-span-3"
          />
          <select name="bodySystem" defaultValue={searchParams?.bodySystem} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <option value="">Body system</option>
            <option value="respiratory">Respiratory</option>
            <option value="gastrointestinal">Gastrointestinal</option>
            <option value="neurological">Neurological</option>
            <option value="skin">Skin</option>
            <option value="blood">Blood</option>
            <option value="urinary">Urinary</option>
            <option value="reproductive">Reproductive</option>
            <option value="systemic">Systemic</option>
          </select>
          <select name="severity" defaultValue={searchParams?.severity} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <option value="">Severity</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="critical">Critical</option>
          </select>
          <button type="submit" className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
            Apply filters
          </button>
        </form>
      </div>

      <div className="glass-panel mb-6 flex items-center justify-between rounded-[2rem] p-4">
        <div className="flex gap-2">
          <a
            href="/diseases?view=grid"
            className={`rounded-full border px-4 py-2 text-xs ${view === "grid" ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
          >
            Grid
          </a>
          <a
            href="/diseases?view=table"
            className={`rounded-full border px-4 py-2 text-xs ${view === "table" ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
          >
            Table
          </a>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-slate-300">
          <ArrowUpDown className="h-4 w-4 text-cyan" />
          Sorted by severity
        </div>
      </div>

      {view === "table" ? (
        <div className="glass-panel overflow-x-auto rounded-[2rem] p-5">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="pb-3">Disease</th>
                <th className="pb-3">ICD-10</th>
                <th className="pb-3">Body system</th>
                <th className="pb-3">Causative microbes</th>
                <th className="pb-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {diseases.map((disease) => (
                <tr key={disease.id}>
                  <td className="py-4">
                    <Link href={`/disease/${disease.slug}`} className="text-white hover:text-cyan">
                      {disease.name}
                    </Link>
                  </td>
                  <td className="py-4 text-slate-300">{disease.icd10Code || "N/A"}</td>
                  <td className="py-4 text-slate-300">{disease.bodySystem}</td>
                  <td className="py-4 text-slate-300">{disease.microbes.map((item) => item.microbe.scientificName).join(", ")}</td>
                  <td className="py-4 capitalize text-slate-300">{disease.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {diseases.map((disease) => (
            <article key={disease.id} className="glass-panel hover-glow rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {disease.icd10Code || "No ICD-10"}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs capitalize ${disease.severity === "critical" || disease.severity === "severe" ? "border-pathogen/30 bg-pathogen/10 text-pathogen" : "border-amber/30 bg-amber/10 text-amber"}`}>
                  {disease.severity}
                </span>
              </div>
              <h2 className="mt-4 font-[var(--font-display)] text-2xl text-white">{disease.name}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {disease.microbes.map((item) => (
                  <Link key={item.microbe.slug} href={`/microbe/${item.microbe.slug}`} className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-xs text-cyan">
                    {item.microbe.scientificName}
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">
                <Activity className="h-4 w-4 text-cyan" />
                {disease.bodySystem}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-300">
                <ShieldAlert className="h-4 w-4 text-amber" />
                Mortality: {disease.mortalityRate ? `${disease.mortalityRate}%` : "Unknown"}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(Array.isArray(disease.symptoms) ? disease.symptoms : []).slice(0, 4).map((symptom) => (
                  <span key={String(symptom)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {String(symptom)}
                  </span>
                ))}
              </div>
              <Link href={`/disease/${disease.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm text-cyan hover:underline">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
