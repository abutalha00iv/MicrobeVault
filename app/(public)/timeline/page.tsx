import { Timeline } from "@/components/Timeline";
import { getTimelineData } from "@/lib/repository";

const ERAS = [
  { label: "Ancient/Medieval", value: "ancient" },
  { label: "1600s–1800s", value: "1600-1800" },
  { label: "1900–1950", value: "1900-1950" },
  { label: "1950–2000", value: "1950-2000" },
  { label: "2000–present", value: "2000-present" }
];

export default async function TimelinePage({
  searchParams
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const era = searchParams?.era;
  const events = await getTimelineData(era);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Discovery timeline</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">From early microscopy to genomic epidemiology</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/timeline"
            className={`rounded-full border px-3 py-1.5 text-xs ${!era ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
          >
            All
          </a>
          {ERAS.map((item) => (
            <a
              key={item.value}
              href={`/timeline?era=${item.value}`}
              className={`rounded-full border px-3 py-1.5 text-xs ${era === item.value ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <Timeline events={events} />
    </div>
  );
}

