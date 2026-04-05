"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MicrobeCard } from "@/components/MicrobeCard";

type CarouselItem = {
  slug: string;
  commonName: string;
  scientificName: string;
  descriptionShort: string;
  imageUrl?: string | null;
  kingdomLabel?: string | null;
  isDangerous: boolean;
  isBeneficial: boolean;
};

export function FeaturedCarousel({ microbes }: { microbes: CarouselItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (microbes.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % microbes.length), 4500);
    return () => window.clearInterval(timer);
  }, [microbes.length]);

  if (!microbes.length) {
    return null;
  }

  const visible = Array.from({ length: Math.min(3, microbes.length) }, (_, offset) => microbes[(index + offset) % microbes.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Featured Collection</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Spotlight microbes</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIndex((current) => (current - 1 + microbes.length) % microbes.length)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:border-cyan hover:text-cyan"
            aria-label="Previous featured microbe"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % microbes.length)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:border-cyan hover:text-cyan"
            aria-label="Next featured microbe"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {visible.map((microbe) => (
          <MicrobeCard key={microbe.slug} microbe={microbe} />
        ))}
      </div>
    </div>
  );
}
