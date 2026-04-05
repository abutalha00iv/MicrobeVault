import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { searchAll } from "@/lib/search";

const groupMeta = {
  microbes: { label: "Microbes", href: (slug: string) => `/microbe/${slug}` },
  diseases: { label: "Diseases", href: (slug: string) => `/disease/${slug}` },
  flowcharts: { label: "Flowcharts", href: (slug: string) => `/flowchart/${slug}` },
  timeline: { label: "Timeline", href: (slug: string) => `/timeline#event-${slug}` }
} as const;

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const query = searchParams?.q || "";
  const results = await searchAll(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Search</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Global MicrobeVault search</h1>
      </div>
      <div className="mb-8 max-w-3xl">
        <SearchBar large initialQuery={query} />
      </div>

      <div className="space-y-8">
        {Object.entries(results).map(([group, items]) => (
          <section key={group}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-2xl text-white">{groupMeta[group as keyof typeof groupMeta].label}</h2>
              <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">{items.length}</span>
            </div>
            <div className="grid gap-4">
              {items.length ? (
                items.map((item: any) => (
                  <Link key={`${group}-${item.id}`} href={groupMeta[group as keyof typeof groupMeta].href(item.slug || item.id)} className="glass-panel hover-glow rounded-[1.75rem] p-5">
                    <p className="font-[var(--font-display)] text-xl text-white">{item.title}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.18em] text-cyan">{item.descriptor}</p>
                    <p className="mt-3 text-sm text-slate-300">{item.excerpt}</p>
                  </Link>
                ))
              ) : (
                <div className="glass-panel rounded-[1.75rem] p-5 text-sm text-slate-300">No {group} matched the current query.</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

