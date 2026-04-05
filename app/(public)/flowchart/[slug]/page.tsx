import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { FlowchartViewer } from "@/components/FlowchartViewer";
import { getFlowchartBySlug } from "@/lib/repository";
import { SourceBadge } from "@/components/SourceBadge";

const CATEGORY_LABELS: Record<string, string> = {
  gram_staining: "Gram Staining",
  id_algorithm: "ID Algorithm",
  metabolic: "Metabolic Pathway",
  infection_pathway: "Infection Pathway",
  antibiotic_resistance: "Antibiotic Resistance",
  life_cycle: "Life Cycle",
  ecological: "Ecological",
};

const CATEGORY_COLORS: Record<string, string> = {
  gram_staining: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  id_algorithm: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  metabolic: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  infection_pathway: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  antibiotic_resistance: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  life_cycle: "bg-cyan/15 text-cyan border-cyan/25",
  ecological: "bg-green-500/15 text-green-300 border-green-500/25",
};

export default async function FlowchartDetailPage({ params }: { params: { slug: string } }) {
  const flowchart = await getFlowchartBySlug(params.slug);

  if (!flowchart) {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[flowchart.category] ?? flowchart.category;
  const categoryColor = CATEGORY_COLORS[flowchart.category] ?? "bg-white/10 text-slate-300 border-white/15";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb nav */}
      <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/flowcharts"
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All Flowcharts
        </Link>
        <span className="text-slate-700">/</span>
        <span className="truncate text-slate-400">{flowchart.title}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${categoryColor}`}>
          {categoryLabel}
        </span>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl leading-tight text-white sm:text-5xl">
          {flowchart.title}
        </h1>
        {flowchart.description && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">{flowchart.description}</p>
        )}
      </div>

      {/* Diagram */}
      <FlowchartViewer
        id={flowchart.id}
        title={flowchart.title}
        mermaidCode={flowchart.mermaidCode}
        svgContent={flowchart.svgContent}
        nodeDescriptions={flowchart.nodeDescriptions as Record<string, string> | null}
      />

      {/* References */}
      {flowchart.references.length > 0 && (
        <div className="mt-8 rounded-[2rem] border border-white/[0.07] bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">Source references</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {flowchart.references.map((entry) => (
              <a
                key={entry.reference.id}
                href={
                  entry.reference.url ||
                  (entry.reference.doi ? `https://doi.org/${entry.reference.doi}` : "/references")
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition-colors hover:border-cyan/30 hover:text-cyan"
              >
                <span className="inline-block align-middle">
                  <SourceBadge type={entry.reference.sourceType} />
                </span>
                {entry.reference.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
