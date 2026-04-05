"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminReferenceManager({ initialReferences }: { initialReferences: any[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkDois, setBulkDois] = useState("");

  const save = async () => {
    const response = await fetch("/api/references", {
      method: editing.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(editing)
    });
    const json = await response.json();
    setMessage(response.ok ? "Reference saved." : json.error || "Unable to save reference.");
    if (response.ok) router.refresh();
  };

  const fetchDoi = async (doi: string) => {
    const response = await fetch(`/api/references/crossref?doi=${encodeURIComponent(doi)}`);
    const json = await response.json();
    if (response.ok) {
      setEditing((current: any) => ({ ...current, ...json.result }));
      setMessage("DOI metadata loaded.");
    } else {
      setMessage(json.error || "DOI lookup failed.");
    }
  };

  const bulkImport = async () => {
    const dois = bulkDois.split(/\s+/).map((item) => item.trim()).filter(Boolean);
    for (const doi of dois) {
      const response = await fetch(`/api/references/crossref?doi=${encodeURIComponent(doi)}`);
      const json = await response.json();
      if (response.ok) {
        await fetch("/api/references", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...json.result,
            sourceType: "journal_article",
            isVerified: true
          })
        });
      }
    }
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this reference?")) return;
    await fetch(`/api/references?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr,1.25fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl text-white">References</h2>
          <button
            type="button"
            onClick={() => setEditing({ title: "", authors: "", journalOrPublisher: "", year: "", doi: "", url: "", volume: "", issue: "", pages: "", sourceType: "journal_article", topic: "General Microbiology", accessedDate: new Date().toISOString(), isVerified: true })}
            className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
          >
            Add reference
          </button>
        </div>
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Bulk DOI import</span>
          <textarea value={bulkDois} onChange={(event) => setBulkDois(event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
        </label>
        <button type="button" onClick={bulkImport} className="mt-3 rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
          Import DOIs
        </button>
        <div className="mt-6 space-y-3">
          {initialReferences.map((reference) => (
            <div key={reference.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{reference.title}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing(reference)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                  Edit
                </button>
                <button type="button" onClick={() => remove(reference.id)} className="rounded-full border border-pathogen/30 bg-pathogen/10 px-3 py-1 text-xs text-pathogen">
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
            <h2 className="font-[var(--font-display)] text-2xl text-white">{editing.id ? "Edit reference" : "New reference"}</h2>
            {message ? <p className="text-sm text-slate-200">{message}</p> : null}
            <div className="flex gap-2">
              <input value={editing.doi || ""} onChange={(event) => setEditing((current: any) => ({ ...current, doi: event.target.value }))} placeholder="Paste DOI" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
              <button type="button" onClick={() => fetchDoi(editing.doi)} className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
                Auto-fetch DOI
              </button>
            </div>
            {["title", "authors", "journalOrPublisher", "year", "url", "volume", "issue", "pages", "topic"].map((key) => (
              <label key={key} className="block space-y-2">
                <span className="text-sm capitalize text-slate-200">{key}</span>
                <input value={editing[key] || ""} onChange={(event) => setEditing((current: any) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" />
              </label>
            ))}
            <label className="block space-y-2">
              <span className="text-sm text-slate-200">Source type</span>
              <select value={editing.sourceType} onChange={(event) => setEditing((current: any) => ({ ...current, sourceType: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                {["journal_article", "book", "ncbi", "who", "cdc", "textbook", "wikipedia", "news", "other"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input type="checkbox" checked={editing.isVerified} onChange={(event) => setEditing((current: any) => ({ ...current, isVerified: event.target.checked }))} className="mr-2" />
              Mark as verified
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
          <div className="text-sm text-slate-300">Select a reference to edit or create a new one.</div>
        )}
      </div>
    </div>
  );
}

