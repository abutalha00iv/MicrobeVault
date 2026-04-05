"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export function AdminTimelineManager({
  initialEvents,
  microbes,
  diseases
}: {
  initialEvents: any[];
  microbes: Option[];
  diseases: Option[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    const response = await fetch("/api/timeline", {
      method: editing.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...editing,
        year: Number(editing.year)
      })
    });
    const json = await response.json();
    setMessage(response.ok ? "Timeline event saved." : json.error || "Unable to save event.");
    if (response.ok) router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/timeline?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl text-white">Timeline events</h2>
          <button
            type="button"
            onClick={() => setEditing({ year: new Date().getFullYear(), title: "", description: "", eventType: "research_milestone", significance: "", discoverers: "", country: "", microbeId: "", diseaseId: "" })}
            className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
          >
            Add event
          </button>
        </div>
        <div className="space-y-3">
          {initialEvents.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{event.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{event.year}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing(event)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                  Edit
                </button>
                <button type="button" onClick={() => remove(event.id)} className="rounded-full border border-pathogen/30 bg-pathogen/10 px-3 py-1 text-xs text-pathogen">
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
            <h2 className="font-[var(--font-display)] text-2xl text-white">{editing.id ? "Edit event" : "New event"}</h2>
            {message ? <p className="text-sm text-slate-200">{message}</p> : null}
            {["year", "title", "significance", "discoverers", "country"].map((key) => (
              <label key={key} className="block space-y-2">
                <span className="text-sm capitalize text-slate-200">{key}</span>
                <input value={editing[key] || ""} onChange={(event) => setEditing((current: any) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
              </label>
            ))}
            <label className="block space-y-2">
              <span className="text-sm text-slate-200">Event type</span>
              <select value={editing.eventType} onChange={(event) => setEditing((current: any) => ({ ...current, eventType: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                {["discovery", "epidemic", "treatment", "research_milestone"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-200">Description</span>
              <textarea value={editing.description || ""} onChange={(event) => setEditing((current: any) => ({ ...current, description: event.target.value }))} rows={5} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-200">Linked microbe</span>
              <select value={editing.microbeId || ""} onChange={(event) => setEditing((current: any) => ({ ...current, microbeId: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                <option value="">None</option>
                {microbes.map((microbe) => (
                  <option key={microbe.id} value={microbe.id}>
                    {microbe.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-200">Linked disease</span>
              <select value={editing.diseaseId || ""} onChange={(event) => setEditing((current: any) => ({ ...current, diseaseId: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                <option value="">None</option>
                {diseases.map((disease) => (
                  <option key={disease.id} value={disease.id}>
                    {disease.label}
                  </option>
                ))}
              </select>
            </label>
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
          <div className="text-sm text-slate-300">Select an event to edit or create a new one.</div>
        )}
      </div>
    </div>
  );
}

