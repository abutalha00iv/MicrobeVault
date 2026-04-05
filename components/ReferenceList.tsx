"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Copy } from "lucide-react";
import { SourceBadge } from "@/components/SourceBadge";

type ReferenceEntry = {
  id: string;
  title: string;
  authors?: string | null;
  journalOrPublisher?: string | null;
  year?: number | null;
  doi?: string | null;
  url?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  sourceType: string;
  accessedDate?: string | Date | null;
};

function formatCitation(reference: ReferenceEntry) {
  const base = `${reference.authors || "Unknown author"}. (${reference.year || "n.d."}). ${reference.title}. ${reference.journalOrPublisher || ""}`.trim();
  const detailBits = [reference.volume, reference.issue ? `(${reference.issue})` : null, reference.pages]
    .filter(Boolean)
    .join(", ");

  return detailBits ? `${base}, ${detailBits}.` : `${base}.`;
}

export function ReferenceList({ references }: { references: ReferenceEntry[] }) {
  if (!references.length) {
    return null;
  }

  return (
    <section id="references" className="mt-16 scroll-mt-28">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Sources</p>
        <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">References</h2>
      </div>
      <ol className="space-y-4">
        {references.map((reference, index) => {
          const citation = formatCitation(reference);
          const accessed = reference.accessedDate ? format(new Date(reference.accessedDate), "MMM yyyy") : "Unknown";
          const href = reference.doi ? `https://doi.org/${reference.doi}` : reference.url;

          return (
            <li key={reference.id} id={`reference-${index + 1}`} className="glass-panel rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-3xl">
                  <p className="text-sm leading-7 text-slate-200">
                    <span className="mr-2 font-semibold text-white">[{index + 1}]</span>
                    {reference.authors ? `${reference.authors}. ` : ""}
                    {reference.year ? `(${reference.year}). ` : ""}
                    {reference.title}.{" "}
                    {reference.journalOrPublisher ? <i>{reference.journalOrPublisher}</i> : null}
                    {reference.volume ? `, ${reference.volume}` : ""}
                    {reference.issue ? `(${reference.issue})` : ""}
                    {reference.pages ? `, ${reference.pages}` : ""}
                    .
                  </p>
                  <p className="mt-2 text-xs text-slate-400">Last accessed: {accessed}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SourceBadge type={reference.sourceType} />
                  {href ? (
                    <Link
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-cyan/30 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/10"
                    >
                      {reference.doi ? "DOI" : "View source"}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                    onClick={() => navigator.clipboard.writeText(citation)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
