import { notFound } from "next/navigation";
import { AdminMicrobeEditor } from "@/components/admin/AdminMicrobeEditor";
import { db } from "@/lib/db";

export default async function EditMicrobePage({ params }: { params: { id: string } }) {
  const [microbe, diseases, references] = await Promise.all([
    db.microbe.findUnique({
      where: { id: params.id },
      include: {
        taxonomy: true,
        diseases: true,
        references: true
      }
    }),
    db.disease.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.reference.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } })
  ]);

  if (!microbe) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Edit microbe</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">{microbe.scientificName}</h1>
      </div>
      <AdminMicrobeEditor
        initialData={microbe}
        diseases={diseases.map((disease) => ({ id: disease.id, label: disease.name }))}
        references={references.map((reference) => ({ id: reference.id, label: reference.title }))}
      />
    </div>
  );
}
