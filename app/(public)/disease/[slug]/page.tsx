import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiseaseMap } from "@/components/DiseaseMap";
import { ReferenceList } from "@/components/ReferenceList";
import { getDiseaseBySlug } from "@/lib/repository";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const disease = await getDiseaseBySlug(params.slug);

  if (!disease) {
    return {
      title: "Disease not found"
    };
  }

  return {
    title: disease.name,
    description: disease.description
  };
}

export default async function DiseaseDetailPage({ params }: { params: { slug: string } }) {
  const disease = await getDiseaseBySlug(params.slug);

  if (!disease) {
    notFound();
  }

  const regions = Array.isArray(disease.distributionRegions) ? disease.distributionRegions.map(String) : [];
  const outbreaks = Array.isArray(disease.outbreakTimeline) ? disease.outbreakTimeline : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">Disease profile</p>
            <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">{disease.name}</h1>
            <p className="mt-3 text-sm text-slate-300">{disease.icd10Code || "ICD-10 unavailable"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">{disease.bodySystem}</span>
            <span className={`rounded-full border px-3 py-1 text-xs capitalize ${disease.severity === "critical" || disease.severity === "severe" ? "border-pathogen/30 bg-pathogen/10 text-pathogen" : "border-amber/30 bg-amber/10 text-amber"}`}>
              {disease.severity}
            </span>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <h2 className="font-[var(--font-display)] text-2xl text-white">Description</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{disease.description}</p>
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-xl text-white">Symptoms</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Array.isArray(disease.symptoms) ? disease.symptoms : []).map((symptom) => (
                  <span key={String(symptom)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {String(symptom)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-xl text-white">Pathogenesis</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{disease.pathogenesis || "Pathogenesis summary unavailable."}</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="font-[var(--font-display)] text-xl text-white">Causative organisms</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {disease.microbes.map((item) => (
                  <Link key={item.microbe.id} href={`/microbe/${item.microbe.slug}`} className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                    {item.microbe.scientificName}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-xl text-white">Diagnosis methods</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{disease.diagnosisMethods || "Diagnostic notes unavailable."}</p>
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-xl text-white">Treatment and management</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{disease.treatment || disease.management || "Treatment notes unavailable."}</p>
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-xl text-white">Prevention and vaccines</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{disease.prevention || disease.vaccines || "Prevention summary unavailable."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr,1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan">Distribution</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Global distribution map</h2>
          <div className="mt-6">
            <DiseaseMap activeRegions={regions} />
          </div>
        </div>
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan">Outbreak timeline</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Historical outbreaks</h2>
          <div className="mt-6 space-y-4">
            {outbreaks.map((outbreak: any, index) => (
              <div key={`${outbreak.year}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{outbreak.year || "Unknown year"}</p>
                <p className="mt-2 text-sm text-slate-300">{outbreak.description || String(outbreak)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan">Related diseases</p>
        <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">More in this body system</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {disease.related.map((item) => (
            <Link key={item.slug} href={`/disease/${item.slug}`} className="glass-panel hover-glow rounded-[2rem] p-5">
              <p className="font-[var(--font-display)] text-2xl text-white">{item.name}</p>
              <p className="mt-2 text-sm text-slate-300">{item.icd10Code || "No ICD-10 code"}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan">{item.severity}</p>
            </Link>
          ))}
        </div>
      </section>

      <ReferenceList references={disease.references.map((entry) => entry.reference)} />
    </div>
  );
}
