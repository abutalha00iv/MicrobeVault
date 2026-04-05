import { SOURCE_TYPE_BADGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  journal_article: "border-cyan/30 bg-cyan/10 text-cyan",
  who: "border-amber/30 bg-amber/10 text-amber",
  cdc: "border-pathogen/30 bg-pathogen/10 text-pathogen",
  ncbi: "border-benefit/30 bg-benefit/10 text-benefit",
  textbook: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  book: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  wikipedia: "border-slate-500/30 bg-slate-500/10 text-slate-200",
  news: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  other: "border-white/20 bg-white/10 text-white"
};

export function SourceBadge({ type }: { type: string }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", tones[type] ?? tones.other)}>
      {SOURCE_TYPE_BADGES[type] ?? "Source"}
    </span>
  );
}

