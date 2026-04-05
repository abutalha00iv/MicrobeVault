import Link from "next/link";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import { getHomepageData } from "@/lib/repository";
import { QUICK_EXPLORE } from "@/lib/constants";
import { SearchBar } from "@/components/SearchBar";
import { StatsCounter } from "@/components/StatsCounter";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { MicrobeCard } from "@/components/MicrobeCard";
import { FactRotator } from "@/components/FactRotator";
import { ParticleHero } from "@/components/ParticleHero";

export default async function HomePage({
  searchParams
}: {
  searchParams?: { kingdom?: string };
}) {
  const { stats, featuredMicrobes, latestMicrobes, facts } = await getHomepageData();
  const activeKingdom = searchParams?.kingdom;
  const filtered = activeKingdom ? latestMicrobes.filter((item) => item.kingdomLabel === activeKingdom) : latestMicrobes;

  return (
    <div className="hex-grid">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero" />
        <ParticleHero />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid min-h-[84vh] items-center gap-12 lg:grid-cols-[1fr_400px]">

            {/* Left: text content — all elements share the same column width, no S-shape selection */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan">
                <Sparkles className="h-4 w-4" />
                The Vault of Invisible Life
              </div>
              <h1 className="mt-6 font-[var(--font-display)] text-5xl leading-[1.1] text-white md:text-6xl lg:text-7xl">
                Explore the<br className="hidden sm:block" /> Invisible World
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                The world&apos;s most comprehensive microbiology encyclopedia, AI toolkit, and clinical reference
                platform.
              </p>
              <div className="mt-8">
                <SearchBar large />
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/encyclopedia"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm text-cyan hover:bg-cyan/15"
                >
                  Browse encyclopedia
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/ai-tools"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-100 hover:border-cyan/20"
                >
                  Open AI tools
                </Link>
              </div>
            </div>

            {/* Right: stats panel — desktop only */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center">
              <div className="glass-panel rounded-[2rem] p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan">Vault statistics</p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <StatsCounter label="Microbes" value={stats.microbes} />
                  <StatsCounter label="Diseases" value={stats.diseases} />
                  <StatsCounter label="Kingdoms" value={stats.kingdoms} />
                  <StatsCounter label="Years covered" value={stats.yearsCovered} />
                </div>
                <div className="mt-5 border-t border-white/10 pt-5 space-y-3">
                  <Link href="/encyclopedia" className="flex items-center justify-between text-sm text-slate-300 hover:text-cyan">
                    <span>Full encyclopedia</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/diseases" className="flex items-center justify-between text-sm text-slate-300 hover:text-cyan">
                    <span>Disease database</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/ai-tools" className="flex items-center justify-between text-sm text-slate-300 hover:text-cyan">
                    <span>AI tools</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats row — mobile/tablet only (desktop sees stats in hero right panel) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:hidden lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCounter label="Microbes" value={stats.microbes} />
          <StatsCounter label="Diseases" value={stats.diseases} />
          <StatsCounter label="Kingdoms" value={stats.kingdoms} />
          <StatsCounter label="Years covered" value={stats.yearsCovered} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FeaturedCarousel microbes={featuredMicrobes} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">Quick Explore</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Filter by kingdom</h2>
          </div>
          <Link href="/encyclopedia" className="text-sm text-cyan hover:underline">
            Open full taxonomy browser
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className={`rounded-full border px-4 py-2 text-sm ${!activeKingdom ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
          >
            All kingdoms
          </Link>
          {QUICK_EXPLORE.map((kingdom) => (
            <Link
              key={kingdom}
              href={`/?kingdom=${encodeURIComponent(kingdom)}`}
              className={`rounded-full border px-4 py-2 text-sm ${
                activeKingdom === kingdom ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              {kingdom}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((microbe) => (
            <MicrobeCard key={microbe.slug} microbe={microbe} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
        <div className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Latest additions</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Recently catalogued profiles</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {latestMicrobes.map((microbe) => (
              <MicrobeCard key={microbe.slug} microbe={microbe} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <FactRotator facts={facts} />
          <div className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">Clinical + research</p>
            <h3 className="mt-3 font-[var(--font-display)] text-2xl text-white">Built for laboratories, classrooms, and clinics</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Search live NCBI taxonomy, review disease linkages, open interactive flowcharts, and use guarded AI
              educational tools from a single evidence-linked workspace.
            </p>
            <Link
              href="/ncbi-explorer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-2 text-sm text-amber"
            >
              <FlaskConical className="h-4 w-4" />
              Launch NCBI explorer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
