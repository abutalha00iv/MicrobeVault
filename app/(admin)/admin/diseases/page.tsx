import { AdminDiseaseManager } from "@/components/admin/AdminDiseaseManager";
import { db } from "@/lib/db";

export default async function AdminDiseasesPage() {
  const [diseases, microbes, references] = await Promise.all([
    db.disease.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        microbes: true,
        references: true
      }
    }),
    db.microbe.findMany({ select: { id: true, scientificName: true }, orderBy: { scientificName: "asc" } }),
    db.reference.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Diseases</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Disease management</h1>
      </div>
      <AdminDiseaseManager
        initialDiseases={diseases}
        microbes={microbes.map((microbe) => ({ id: microbe.id, label: microbe.scientificName }))}
        references={references.map((reference) => ({ id: reference.id, label: reference.title }))}
      />
    </div>
  );
}

