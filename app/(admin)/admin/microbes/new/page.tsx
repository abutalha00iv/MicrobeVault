import { AdminMicrobeEditor } from "@/components/admin/AdminMicrobeEditor";
import { db } from "@/lib/db";

export default async function NewMicrobePage() {
  const [diseases, references] = await Promise.all([
    db.disease.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.reference.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">New microbe</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Create microbe profile</h1>
      </div>
      <AdminMicrobeEditor
        diseases={diseases.map((disease) => ({ id: disease.id, label: disease.name }))}
        references={references.map((reference) => ({ id: reference.id, label: reference.title }))}
      />
    </div>
  );
}

