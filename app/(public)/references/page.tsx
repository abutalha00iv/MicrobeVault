import { ReferenceList } from "@/components/ReferenceList";
import { ReferencesExportButtons } from "@/components/ReferencesExportButtons";
import { getReferencesLibrary } from "@/lib/repository";

export default async function ReferencesPage({
  searchParams
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const query = searchParams?.q;
  const sourceType = searchParams?.sourceType;
  const sort = searchParams?.sort;
  const topic = searchParams?.topic;
  const references = await getReferencesLibrary({ query, sourceType, sort, topic });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">References</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Global source library</h1>
        </div>
        <ReferencesExportButtons references={references} />
      </div>

      <div className="glass-panel mb-8 rounded-[2rem] p-5">
        <form className="grid gap-4 md:grid-cols-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search author, journal, keyword"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          />
          <select
            name="sourceType"
            defaultValue={sourceType}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            <option value="">All sources</option>
            <option value="journal_article">Journals</option>
            <option value="who">WHO</option>
            <option value="cdc">CDC</option>
            <option value="ncbi">NCBI</option>
            <option value="textbook">Textbooks</option>
            <option value="book">Books</option>
          </select>
          <select
            name="topic"
            defaultValue={topic}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            <option value="">All topics</option>
            <option value="Bacteria">Bacteria</option>
            <option value="Fungi">Fungi</option>
            <option value="Viruses">Viruses</option>
            <option value="Diseases">Diseases</option>
            <option value="General Microbiology">General Microbiology</option>
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            <option value="year-newest">Year (newest)</option>
            <option value="year-oldest">Year (oldest)</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          <button type="submit" className="rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan md:col-span-4">
            Apply filters
          </button>
        </form>
      </div>

      <ReferenceList references={references} />
    </div>
  );
}
