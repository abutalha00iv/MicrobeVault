import { getFlowcharts } from "@/lib/repository";
import { FlowchartGrid } from "@/components/FlowchartGrid";
import { Network } from "lucide-react";

export default async function FlowchartsPage() {
  const flowcharts = await getFlowcharts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1.5">
          <Network className="h-3.5 w-3.5 text-cyan" />
          <span className="text-xs font-medium tracking-widest text-cyan uppercase">Flowcharts</span>
        </div>
        <h1 className="font-[var(--font-display)] text-4xl text-white sm:text-5xl">
          Interactive microbiology
          <br />
          <span className="text-cyan">diagrams</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Explore step-by-step visual flowcharts covering identification algorithms, metabolic pathways, infection
          mechanisms, and more. Click any node to reveal explanations.
        </p>
        {flowcharts.length > 0 && (
          <div className="mt-6 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-white">{flowcharts.length}</p>
              <p className="text-xs text-slate-500">Diagrams</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">
                {new Set(flowcharts.map((f) => f.category)).size}
              </p>
              <p className="text-xs text-slate-500">Categories</p>
            </div>
          </div>
        )}
      </div>

      <FlowchartGrid flowcharts={flowcharts} />
    </div>
  );
}
