import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { MicrobeListClient } from "@/components/admin/MicrobeListClient";

export default async function AdminMicrobesPage() {
  const microbes = await db.microbe.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      scientificName: true,
      commonName: true,
      updatedAt: true,
      kingdomLabel: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Microbes</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Microbe management</h1>
        </div>
        <Link
          href="/admin/microbes/new"
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan hover:bg-cyan/15 transition"
        >
          <Plus className="h-4 w-4" />
          Add microbe
        </Link>
      </div>

      <MicrobeListClient microbes={microbes} />
    </div>
  );
}
