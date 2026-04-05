import { EcologyGraph } from "@/components/EcologyGraph";
import { getEcologyData } from "@/lib/repository";

const BODY_MAP = [
  { key: "oral", label: "Oral cavity", left: "48%", top: "8%" },
  { key: "skin", label: "Skin", left: "50%", top: "26%" },
  { key: "gut", label: "Gut", left: "52%", top: "48%" },
  { key: "urogenital", label: "Urogenital tract", left: "52%", top: "72%" }
];

export default async function EcologyPage() {
  const { microbes, graph } = await getEcologyData();
  const goodVsBad = microbes
    .slice(0, 12)
    .map((microbe) => ({
      scientificName: microbe.scientificName,
      relationshipType: microbe.relationshipType,
      role: microbe.ecologicalRole,
      status: microbe.isDangerous ? "Pathogen" : microbe.isBeneficial ? "Beneficial" : "Neutral"
    }))
    .sort((a, b) => a.status.localeCompare(b.status));

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Ecology</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Relationships across hosts, habitats, and microbiomes</h1>
      </div>

      <section>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan">Force-directed graph</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Microbe-host relationship web</h2>
        </div>
        <EcologyGraph nodes={graph.nodes} links={graph.links} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr,1.2fr]">
        <div className="glass-panel relative min-h-[480px] rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan">Human microbiome</p>
          <h2 className="mt-2 font-[var(--font-display)] text-2xl text-white">Body map</h2>
          <div className="relative mt-6 h-[360px]">
            <div className="absolute inset-x-[40%] top-6 h-20 rounded-full border border-cyan/20 bg-cyan/10" />
            <div className="absolute inset-x-[34%] top-28 h-28 rounded-[2rem] border border-cyan/20 bg-white/5" />
            <div className="absolute left-[38%] top-28 h-40 w-10 rounded-full border border-cyan/20 bg-white/5" />
            <div className="absolute right-[38%] top-28 h-40 w-10 rounded-full border border-cyan/20 bg-white/5" />
            <div className="absolute left-[42%] top-[15rem] h-40 w-10 rounded-full border border-cyan/20 bg-white/5" />
            <div className="absolute right-[42%] top-[15rem] h-40 w-10 rounded-full border border-cyan/20 bg-white/5" />
            {BODY_MAP.map((point) => (
              <button
                key={point.key}
                type="button"
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1.5 text-xs text-amber"
                style={{ left: point.left, top: point.top }}
              >
                {point.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan">Comparison</p>
          <h2 className="mt-2 font-[var(--font-display)] text-2xl text-white">Good vs bad microbes</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="pb-3">Microbe</th>
                  <th className="pb-3">Relationship</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Ecological role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {goodVsBad.map((row) => (
                  <tr key={row.scientificName}>
                    <td className="py-3 text-white">{row.scientificName}</td>
                    <td className="py-3 capitalize text-slate-300">{row.relationshipType || "Unknown"}</td>
                    <td className="py-3 text-slate-300">{row.status}</td>
                    <td className="py-3 text-slate-300">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

