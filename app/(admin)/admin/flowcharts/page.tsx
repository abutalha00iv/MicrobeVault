import { AdminFlowchartManager } from "@/components/admin/AdminFlowchartManager";
import { db } from "@/lib/db";

export default async function AdminFlowchartsPage() {
  const [flowcharts, references] = await Promise.all([
    db.flowchart.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        references: true
      }
    }),
    db.reference.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Flowcharts</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Flowchart management</h1>
      </div>
      <AdminFlowchartManager
        initialFlowcharts={flowcharts}
        references={references.map((reference) => ({ id: reference.id, label: reference.title }))}
      />
    </div>
  );
}

