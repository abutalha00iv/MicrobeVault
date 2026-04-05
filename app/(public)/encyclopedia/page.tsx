import { SearchBar } from "@/components/SearchBar";
import { MicrobeCard } from "@/components/MicrobeCard";
import { Pagination } from "@/components/Pagination";
import { TaxonomyTree } from "@/components/TaxonomyTree";
import { getEncyclopediaData } from "@/lib/repository";

export const revalidate = 3600;

export default async function EncyclopediaPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const page = Number(searchParams?.page || 1);
  const sort = String(searchParams?.sort || "a-z");
  const search = String(searchParams?.q || "");
  const kingdoms = typeof searchParams?.kingdom === "string" ? searchParams.kingdom.split(",") : [];
  const dangerous = searchParams?.dangerous === "1";
  const beneficial = searchParams?.beneficial === "1";
  const relationship = typeof searchParams?.relationship === "string" ? searchParams.relationship.split(",") : [];
  const view = String(searchParams?.view || "grid");

  const data = await getEncyclopediaData({
    page,
    sort,
    search,
    kingdoms,
    dangerous,
    beneficial,
    relationship
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Encyclopedia</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Taxonomy browser</h1>
        </div>
        <div className="w-full max-w-2xl">
          <SearchBar initialQuery={search} placeholder="Search within the encyclopedia" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <aside className="space-y-5">
          <details open className="glass-panel rounded-[2rem] p-5">
            <summary className="cursor-pointer text-sm font-medium text-white">Taxonomy tree</summary>
            <div className="mt-4">
              <TaxonomyTree nodes={data.taxonomyTree} />
            </div>
          </details>

          <div className="glass-panel rounded-[2rem] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Filters</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/encyclopedia?dangerous=1"
                className={`rounded-full border px-3 py-1.5 text-xs ${dangerous ? "border-pathogen/30 bg-pathogen/10 text-pathogen" : "border-white/10 bg-white/5 text-slate-200"}`}
              >
                Dangerous
              </a>
              <a
                href="/encyclopedia?beneficial=1"
                className={`rounded-full border px-3 py-1.5 text-xs ${beneficial ? "border-benefit/30 bg-benefit/10 text-benefit" : "border-white/10 bg-white/5 text-slate-200"}`}
              >
                Beneficial
              </a>
              <a
                href="/encyclopedia"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
              >
                Reset
              </a>
            </div>
          </div>
        </aside>

        <div>
          <div className="glass-panel mb-6 flex flex-col gap-4 rounded-[2rem] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {["a-z", "z-a", "oldest", "newest", "dangerous", "beneficial"].map((option) => (
                <a
                  key={option}
                  href={`/encyclopedia?sort=${option}`}
                  className={`rounded-full border px-3 py-1.5 text-xs ${sort === option ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
                >
                  {option}
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <a
                href={`/encyclopedia?view=grid`}
                className={`rounded-full border px-4 py-2 text-xs ${view === "grid" ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
              >
                Grid view
              </a>
              <a
                href={`/encyclopedia?view=list`}
                className={`rounded-full border px-4 py-2 text-xs ${view === "list" ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
              >
                List view
              </a>
            </div>
          </div>

          {view === "list" ? (
            <div className="space-y-4">
              {data.items.map((microbe) => (
                <div key={microbe.id} className="glass-panel rounded-[1.75rem] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <a href={`/microbe/${microbe.slug}`} className="font-[var(--font-display)] text-xl text-white">
                        <em>{microbe.scientificName}</em>
                      </a>
                      <p className="mt-1 text-sm text-slate-300">{microbe.commonName}</p>
                    </div>
                    <p className="max-w-xl text-sm text-slate-300">{microbe.descriptionShort}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((microbe) => (
                <MicrobeCard key={microbe.id} microbe={microbe} />
              ))}
            </div>
          )}

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            basePath="/encyclopedia"
            searchParams={new URLSearchParams(
              Object.entries(searchParams || {}).reduce<Record<string, string>>((acc, [key, value]) => {
                if (typeof value === "string") acc[key] = value;
                return acc;
              }, {})
            )}
          />
        </div>
      </div>
    </div>
  );
}
