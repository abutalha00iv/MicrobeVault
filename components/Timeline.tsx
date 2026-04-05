"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type TimelineEventItem = {
  id: string;
  year: number;
  title: string;
  description: string;
  significance?: string | null;
  discoverers?: string | null;
  country?: string | null;
  microbe?: { slug: string; scientificName: string } | null;
  disease?: { slug: string; name: string } | null;
};

export function Timeline({ events }: { events: TimelineEventItem[] }) {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan/0 via-cyan/50 to-cyan/0 lg:block" />
      <div className="space-y-10">
        {events.map((event, index) => {
          const left = index % 2 === 0;

          return (
            <motion.article
              id={`event-${event.id}`}
              key={event.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className={`relative lg:grid lg:grid-cols-2 ${left ? "" : "lg:[&>*:first-child]:order-2"}`}
            >
              <div className="hidden lg:block" />
              <div className={`${left ? "lg:pr-10" : "lg:pl-10"}`}>
                <div className="glass-panel rounded-[2rem] p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 font-[var(--font-display)] text-xl text-cyan">
                      {event.year}
                    </span>
                    {event.significance ? (
                      <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber">
                        {event.significance}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-[var(--font-display)] text-2xl text-white">{event.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{event.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {(event.discoverers || "Unknown discoverer") + (event.country ? ` • ${event.country}` : "")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {event.microbe ? (
                      <Link href={`/microbe/${event.microbe.slug}`} className="text-sm text-cyan hover:underline">
                        View microbe profile
                      </Link>
                    ) : null}
                    {event.disease ? (
                      <Link href={`/disease/${event.disease.slug}`} className="text-sm text-cyan hover:underline">
                        View disease page
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

