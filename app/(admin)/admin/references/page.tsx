import { AdminReferenceManager } from "@/components/admin/AdminReferenceManager";
import { db } from "@/lib/db";

export default async function AdminReferencesPage() {
  const references = await db.reference.findMany({
    orderBy: { year: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">References</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Reference management</h1>
      </div>
      <AdminReferenceManager initialReferences={references} />
    </div>
  );
}

