"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export function AdminDiseaseManager({
  initialDiseases,
  microbes,
  references
}: {
  initialDiseases: any[];
  microbes: Option[];
  references: Option[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialDiseases);
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    const payload = {
      id: editing.id,
      name: editing.name,
      slug: editing.slug,
      description: editing.description,
      icd10Code: editing.icd10Code,
      bodySystem: editing.bodySystem,
      severity: editing.severity,
      transmissionRoute: editing.transmissionRoute,
      incubationPeriod: editing.incubationPeriod,
      treatment: editing.treatment,
      mortalityRate: editing.mortalityRate ? Number(editing.mortalityRate) : null,
      isEndemic: Boolean(editing.isEndemic),
      isEpidemic: Boolean(editing.isEpidemic),
      pathogenesis: editing.pathogenesis,
      diagnosisMethods: editing.diagnosisMethods,
      management: editing.management,
      prevention: editing.prevention,
      vaccines: editing.vaccines,
      symptoms: editing.symptomsText.split(",").map((item: string) => item.trim()).filter(Boolean),
      distributionRegions: editing.distributionRegionsText.split(",").map((item: string) => item.trim()).filter(Boolean),
      outbreakTimeline: JSON.parse(editing.outbreakTimelineText || "[]"),
      microbeIds: editing.microbeIds,
      referenceIds: editing.referenceIds
    };

    const response = await fetch("/api/diseases", {
      method: editing.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    if (response.ok) {
      setMessage("Disease saved.");
      router.refresh();
    } else {
      setMessage(json.error || "Unable to save disease.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this disease?")) return;
    await fetch(`/api/diseases?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl text-white">Diseases</h2>
          <button
            type="button"
            onClick={() =>
              setEditing({
                name: "",
                slug: "",
                description: "",
                bodySystem: "respiratory",
                severity: "moderate",
                transmissionRoute: "",
                incubationPeriod: "",
                symptomsText: "",
                treatment: "",
                mortalityRate: "",
                isEndemic: false,
                isEpidemic: false,
                pathogenesis: "",
                diagnosisMethods: "",
                management: "",
                prevention: "",
                vaccines: "",
                distributionRegionsText: "",
                outbreakTimelineText: "",
                microbeIds: [],
                referenceIds: []
              })
            }
            className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
          >
            Add disease
          </button>
        </div>
        <div className="space-y-3">
          {items.map((disease) => (
            <div key={disease.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{disease.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{disease.bodySystem}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing({ ...disease, symptomsText: (disease.symptoms || []).join(", "), distributionRegionsText: (disease.distributionRegions || []).join(", "), outbreakTimelineText: JSON.stringify(disease.outbreakTimeline || []), microbeIds: disease.microbes.map((entry: any) => entry.microbeId), referenceIds: disease.references?.map((entry: any) => entry.referenceId) || [] })} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                  Edit
                </button>
                <button type="button" onClick={() => remove(disease.id)} className="rounded-full border border-pathogen/30 bg-pathogen/10 px-3 py-1 text-xs text-pathogen">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        {editing ? (
          <div className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl text-white">{editing.id ? "Edit disease" : "New disease"}</h2>
            {message ? <p className="text-sm text-slate-200">{message}</p> : null}
            {[
              ["name", "Name"],
              ["slug", "Slug"],
              ["icd10Code", "ICD-10 code"],
              ["transmissionRoute", "Transmission route"],
              ["incubationPeriod", "Incubation period"],
              ["mortalityRate", "Mortality rate"]
            ].map(([key, label]) => (
              <label key={key} className="block space-y-2">
                <span className="text-sm text-slate-200">{label}</span>
                <input value={editing[key] || ""} onChange={(event) => setEditing((current: any) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
              </label>
            ))}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-200">Body system</span>
                <select value={editing.bodySystem} onChange={(event) => setEditing((current: any) => ({ ...current, bodySystem: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                  {["respiratory", "gastrointestinal", "neurological", "skin", "blood", "urinary", "reproductive", "systemic"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-200">Severity</span>
                <select value={editing.severity} onChange={(event) => setEditing((current: any) => ({ ...current, severity: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                  {["mild", "moderate", "severe", "critical"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {[
              ["description", "Description"],
              ["pathogenesis", "Pathogenesis"],
              ["diagnosisMethods", "Diagnosis methods"],
              ["management", "Management"],
              ["treatment", "Treatment"],
              ["prevention", "Prevention"],
              ["vaccines", "Vaccines"],
              ["symptomsText", "Symptoms (comma-separated)"],
              ["distributionRegionsText", "Distribution regions (comma-separated region ids)"],
              ["outbreakTimelineText", "Outbreak timeline JSON"]
            ].map(([key, label]) => (
              <label key={key} className="block space-y-2">
                <span className="text-sm text-slate-200">{label}</span>
                <textarea value={editing[key] || ""} onChange={(event) => setEditing((current: any) => ({ ...current, [key]: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
              </label>
            ))}
            <div>
              <p className="mb-2 text-sm text-slate-200">Linked microbes</p>
              <div className="max-h-40 space-y-2 overflow-auto">
                {microbes.map((microbe) => (
                  <label key={microbe.id} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={editing.microbeIds.includes(microbe.id)}
                      onChange={(event) =>
                        setEditing((current: any) => ({
                          ...current,
                          microbeIds: event.target.checked ? [...current.microbeIds, microbe.id] : current.microbeIds.filter((id: string) => id !== microbe.id)
                        }))
                      }
                      className="mr-2"
                    />
                    {microbe.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-slate-200">References</p>
              <div className="max-h-40 space-y-2 overflow-auto">
                {references.map((reference) => (
                  <label key={reference.id} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={editing.referenceIds.includes(reference.id)}
                      onChange={(event) =>
                        setEditing((current: any) => ({
                          ...current,
                          referenceIds: event.target.checked ? [...current.referenceIds, reference.id] : current.referenceIds.filter((id: string) => id !== reference.id)
                        }))
                      }
                      className="mr-2"
                    />
                    {reference.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={save} className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
                Save
              </button>
              <button type="button" onClick={() => setEditing(null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-300">Select a disease to edit or create a new one.</div>
        )}
      </div>
    </div>
  );
}
