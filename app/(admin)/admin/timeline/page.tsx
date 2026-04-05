import { AdminTimelineManager } from "@/components/admin/AdminTimelineManager";
import { db } from "@/lib/db";

export default async function AdminTimelinePage() {
  const [events, microbes, diseases] = await Promise.all([
    db.timelineEvent.findMany({ orderBy: { year: "desc" } }),
    db.microbe.findMany({ select: { id: true, scientificName: true }, orderBy: { scientificName: "asc" } }),
    db.disease.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Timeline</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Timeline management</h1>
      </div>
      <AdminTimelineManager
        initialEvents={events}
        microbes={microbes.map((microbe) => ({ id: microbe.id, label: microbe.scientificName }))}
        diseases={diseases.map((disease) => ({ id: disease.id, label: disease.name }))}
      />
    </div>
  );
}

