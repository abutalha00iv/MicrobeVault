"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowchartViewer } from "@/components/FlowchartViewer";

type Option = { id: string; label: string };

export function AdminFlowchartManager({
  initialFlowcharts,
  references
}: {
  initialFlowcharts: any[];
  references: Option[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    const payload = {
      id: editing.id,
      title: editing.title,
      slug: editing.slug,
      description: editing.description,
      category: editing.category,
      svgContent: editing.svgContent,
      mermaidCode: editing.mermaidCode,
      nodeDescriptions: editing.nodeDescriptions || {},
      referenceIds: editing.referenceIds || []
    };

    const response = await fetch("/api/flowcharts", {
      method: editing.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setMessage(response.ok ? "Flowchart saved." : json.error || "Unable to save flowchart.");
    if (response.ok) router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this flowchart?")) return;
    await fetch(`/api/flowcharts?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr,1.25fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl text-white">Flowcharts</h2>
          <button
            type="button"
            onClick={() => setEditing({ title: "", slug: "", description: "", category: "gram_staining", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", mermaidCode: "graph TD\nA[Start]-->B[Process]", nodeDescriptions: {}, referenceIds: [] })}
            className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
          >
            Add flowchart
          </button>
        </div>
        <div className="space-y-3">
          {initialFlowcharts.map((flowchart) => (
            <div key={flowchart.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{flowchart.title}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing({ ...flowchart, referenceIds: flowchart.references?.map((entry: any) => entry.referenceId) || [] })} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                  Edit
                </button>
                <button type="button" onClick={() => remove(flowchart.id)} className="rounded-full border border-pathogen/30 bg-pathogen/10 px-3 py-1 text-xs text-pathogen">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-[2rem] p-6">
          {editing ? (
            <div className="space-y-4">
              <h2 className="font-[var(--font-display)] text-2xl text-white">{editing.id ? "Edit flowchart" : "New flowchart"}</h2>
              {message ? <p className="text-sm text-slate-200">{message}</p> : null}
              {["title", "slug", "description"].map((key) => (
                <label key={key} className="block space-y-2">
                  <span className="text-sm capitalize text-slate-200">{key}</span>
                  {key === "description" ? (
                    <textarea value={editing[key] || ""} onChange={(event) => setEditing((current: any) => ({ ...current, [key]: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
                  ) : (
                    <input value={editing[key] || ""} onChange={(event) => setEditing((current: any) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
                  )}
                </label>
              ))}
              <label className="block space-y-2">
                <span className="text-sm text-slate-200">Category</span>
                <select value={editing.category} onChange={(event) => setEditing((current: any) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                  {["gram_staining", "id_algorithm", "metabolic", "infection_pathway", "antibiotic_resistance", "life_cycle", "ecological"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-slate-200">Mermaid code</span>
                <textarea value={editing.mermaidCode || ""} onChange={(event) => setEditing((current: any) => ({ ...current, mermaidCode: event.target.value }))} rows={10} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-slate-200">SVG upload / fallback SVG</span>
                <textarea value={editing.svgContent || ""} onChange={(event) => setEditing((current: any) => ({ ...current, svgContent: event.target.value }))} rows={6} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white" />
              </label>
              <div>
                <p className="mb-2 text-sm text-slate-200">References</p>
                <div className="max-h-48 space-y-2 overflow-auto">
                  {references.map((reference) => (
                    <label key={reference.id} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={(editing.referenceIds || []).includes(reference.id)}
                        onChange={(event) =>
                          setEditing((current: any) => ({
                            ...current,
                            referenceIds: event.target.checked
                              ? [...(current.referenceIds || []), reference.id]
                              : (current.referenceIds || []).filter((id: string) => id !== reference.id)
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
            <div className="text-sm text-slate-300">Select a flowchart to edit or create a new one.</div>
          )}
        </div>

        {editing ? (
          <div className="glass-panel rounded-[2rem] p-6">
            <h2 className="mb-4 font-[var(--font-display)] text-2xl text-white">Live preview</h2>
            <FlowchartViewer
              id={editing.id || "preview"}
              title={editing.title || "Preview flowchart"}
              mermaidCode={editing.mermaidCode}
              svgContent={editing.svgContent}
              nodeDescriptions={editing.nodeDescriptions || {}}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
