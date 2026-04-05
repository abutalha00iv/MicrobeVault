import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Leaf, Shield } from "lucide-react";
import { KINGDOM_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MicrobeCardProps = {
  microbe: {
    slug: string;
    commonName: string;
    scientificName: string;
    descriptionShort: string;
    imageUrl?: string | null;
    kingdomLabel?: string | null;
    isDangerous: boolean;
    isBeneficial: boolean;
  };
};

export function MicrobeCard({ microbe }: MicrobeCardProps) {
  const kingdomClass = KINGDOM_COLORS[microbe.kingdomLabel || ""] ?? "border-white/15 bg-white/5 text-white";

  return (
    <Link
      href={`/microbe/${microbe.slug}`}
      className="group glass-panel hover-glow block overflow-hidden rounded-[1.75rem]"
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={microbe.imageUrl || "https://commons.wikimedia.org/wiki/Special:FilePath/Bacteriophage.jpg"}
          alt={`${microbe.scientificName} microscopy image`}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", kingdomClass)}>
            {microbe.kingdomLabel || "Unclassified"}
          </span>
          {microbe.isDangerous ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-pathogen/30 bg-pathogen/10 px-2.5 py-1 text-xs text-pathogen">
              <AlertTriangle className="h-3.5 w-3.5" />
              Dangerous
            </span>
          ) : microbe.isBeneficial ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-benefit/30 bg-benefit/10 px-2.5 py-1 text-xs text-benefit">
              <Leaf className="h-3.5 w-3.5" />
              Beneficial
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
              <Shield className="h-3.5 w-3.5" />
              Neutral
            </span>
          )}
        </div>
        <div>
          <p className="font-[var(--font-display)] text-xl text-white">
            <em>{microbe.scientificName}</em>
          </p>
          <p className="mt-1 text-sm text-slate-300">{microbe.commonName}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-300">{microbe.descriptionShort}</p>
      </div>
    </Link>
  );
}

