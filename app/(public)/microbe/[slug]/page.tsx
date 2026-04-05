import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleDot, FlaskConical, ShieldAlert } from "lucide-react";
import { ImageGallery } from "@/components/ImageGallery";
import { MicrobeCard } from "@/components/MicrobeCard";
import { MicrobeProfileTabs } from "@/components/MicrobeProfileTabs";
import { NCBIPanel } from "@/components/NCBIPanel";
import { ReferenceList } from "@/components/ReferenceList";
import { VideoGallery } from "@/components/VideoGallery";
import { getCurrentAdmin } from "@/lib/auth";
import { getMicrobeBySlug } from "@/lib/repository";
import { absoluteUrl } from "@/lib/utils";

function stat(label: string, value?: string | number | null) {
  return { label, value: value || "Unknown" };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const microbe = await getMicrobeBySlug(params.slug);

  if (!microbe) {
    return {
      title: "Microbe not found"
    };
  }

  return {
    title: microbe.scientificName,
    description: microbe.descriptionShort,
    openGraph: {
      title: microbe.scientificName,
      description: microbe.descriptionShort,
      images: [absoluteUrl(`/microbe/${params.slug}/opengraph-image`)]
    }
  };
}

export default async function MicrobeProfilePage({ params }: { params: { slug: string } }) {
  const [microbe, admin] = await Promise.all([getMicrobeBySlug(params.slug), getCurrentAdmin()]);

  if (!microbe) {
    notFound();
  }

  const taxonomyTrail = [
    microbe.taxonomy?.domain,
    microbe.taxonomy?.kingdom,
    microbe.taxonomy?.phylum,
    microbe.taxonomy?.taxClass,
    microbe.taxonomy?.order,
    microbe.taxonomy?.family,
    microbe.taxonomy?.genus,
    microbe.taxonomy?.species
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10">
        <div className="absolute inset-0">
          <Image
            src={microbe.imageUrl || "https://commons.wikimedia.org/wiki/Special:FilePath/Bacteriophage.jpg"}
            alt={`${microbe.scientificName} hero image`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
        </div>
        <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-[1.2fr,0.8fr] lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">Microbe profile</p>
            <h1 className="mt-3 font-[var(--font-display)] text-5xl text-white">
              <em>{microbe.scientificName}</em>
            </h1>
            <p className="mt-3 text-lg text-slate-200">{microbe.commonName}</p>
            <p className="mt-5 text-sm leading-7 text-slate-300">{taxonomyTrail.join(" > ")}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">BSL {microbe.bslLevel || "?"}</span>
              <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan capitalize">{microbe.gramStain || "Gram unknown"}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 capitalize">
                {microbe.oxygenRequirement || "oxygen unknown"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Motility: {microbe.motility ? "Yes" : "No"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 capitalize">
                <CircleDot className="h-3.5 w-3.5 text-cyan" />
                {microbe.morphology || "unknown morphology"}
              </span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              stat("Discovery year", microbe.discoveryYear),
              stat("Discovered by", microbe.discoveredBy),
              stat("Size", microbe.sizeUm),
              stat("Temperature range", microbe.temperatureRange),
              stat("pH range", microbe.phRange),
              stat("Kingdom", microbe.kingdomLabel)
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm text-slate-100">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MicrobeProfileTabs microbe={microbe} />

      <ImageGallery images={microbe.images} />

      <VideoGallery videos={microbe.videos} query={microbe.scientificName} microbeId={microbe.id} />

      <NCBIPanel
        microbeId={microbe.id}
        scientificName={microbe.scientificName}
        taxonomyId={microbe.ncbiTaxonomyId}
        isAdmin={Boolean(admin)}
        initialData={
          microbe.ncbiData
            ? {
                taxonomyJson: microbe.ncbiData.taxonomyJson as Record<string, unknown>,
                genbankCount: microbe.ncbiData.genbankCount,
                pubmedCount: microbe.ncbiData.pubmedCount,
                sequenceSummary: microbe.ncbiData.sequenceSummary,
                lastFetched: microbe.ncbiData.lastFetched,
                pubmedAbstracts: (microbe.ncbiData.pubmedAbstracts as Array<{ pmid: string; title: string; abstract: string }>) || []
              }
            : null
        }
      />

      <section className="mt-12">
        <div className="mb-6 flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-cyan" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan">Related microbes</p>
            <h2 className="mt-1 font-[var(--font-display)] text-3xl text-white">You might also be interested in</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {microbe.related.map((item) => (
            <MicrobeCard key={item.slug} microbe={item} />
          ))}
        </div>
      </section>

      {microbe.isDangerous ? (
        <div className="mt-12 rounded-[2rem] border border-pathogen/30 bg-pathogen/10 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 h-5 w-5 text-pathogen" />
            <p className="text-sm leading-7 text-rose-100">
              This organism is flagged as potentially dangerous within the MicrobeVault dataset. Review the clinical,
              biosafety, and treatment sections carefully before using the profile in laboratory or educational planning.
            </p>
          </div>
        </div>
      ) : null}

      <ReferenceList references={microbe.references.map((entry) => entry.reference)} />
    </div>
  );
}
