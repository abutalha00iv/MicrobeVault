import {
  BookOpen,
  Bot,
  BrainCircuit,
  Database,
  FlaskConical,
  GitBranch,
  Home,
  LineChart,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export const BRAND_NAME = "MicrobeVault";
export const TAGLINE = "The Vault of Invisible Life";
export const DESCRIPTION =
  "MicrobeVault is a production-grade microbiology encyclopedia, AI toolkit, clinical reference platform, and source-linked research companion.";

export const FOOTER_DISCLAIMER =
  "Information on MicrobeVault is compiled from peer-reviewed scientific literature, WHO/CDC guidelines, and established microbiology references. This website is for educational purposes only. For clinical or medical decisions, always consult a licensed healthcare professional. All sources are cited and linked on individual content pages.";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/encyclopedia", label: "Encyclopedia", icon: BookOpen },
  { href: "/diseases", label: "Disease Library", icon: ShieldAlert },
  {
    href: "/ai-tools",
    label: "AI Tools",
    icon: Bot,
    children: [
      { href: "/ai-tools/trait-identifier", label: "Trait Identifier" },
      { href: "/ai-tools/image-detector", label: "Image AI" },
      { href: "/ai-tools/clinical-support", label: "Clinical Support" }
    ]
  },
  { href: "/flowcharts", label: "Flowcharts", icon: GitBranch },
  { href: "/timeline", label: "Discovery Timeline", icon: LineChart },
  { href: "/ncbi-explorer", label: "NCBI Explorer", icon: Database },
  { href: "/ecology", label: "Ecology", icon: FlaskConical },
  { href: "/about", label: "About / How to use", icon: Sparkles }
] as const;

export const QUICK_EXPLORE = [
  "Bacteria",
  "Fungi",
  "Viruses",
  "Archaea",
  "Protozoa",
  "Algae",
  "Prions"
] as const;

export const KINGDOM_COLORS: Record<string, string> = {
  Bacteria: "bg-cyan/15 text-cyan border-cyan/30",
  Fungi: "bg-amber/15 text-amber border-amber/30",
  Algae: "bg-benefit/15 text-benefit border-benefit/30",
  Virus: "bg-pathogen/15 text-pathogen border-pathogen/30",
  Viruses: "bg-pathogen/15 text-pathogen border-pathogen/30",
  Archaea: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Protozoa: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  Prions: "bg-slate-400/15 text-slate-200 border-slate-400/30"
};

export const RELATIONSHIP_TYPES = [
  "mutualistic",
  "commensal",
  "parasitic",
  "saprophytic",
  "predation"
] as const;

export const DISEASE_BODY_SYSTEMS = [
  "respiratory",
  "gastrointestinal",
  "neurological",
  "skin",
  "blood",
  "urinary",
  "reproductive",
  "systemic"
] as const;

export const SOURCE_TYPE_BADGES: Record<string, string> = {
  journal_article: "Journal",
  book: "Book",
  ncbi: "NCBI",
  who: "WHO",
  cdc: "CDC",
  textbook: "Textbook",
  wikipedia: "Wikipedia",
  news: "News",
  other: "Other"
};
