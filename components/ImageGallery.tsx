"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

type GalleryImage = {
  id: string;
  imageUrl: string;
  imageType: string;
  caption?: string | null;
  sourceCredit?: string | null;
  altText?: string | null;
};

const FILTERS = ["All", "SEM", "light", "fluorescence", "illustration", "life_cycle"];

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<GalleryImage | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") {
      return images;
    }
    return images.filter((image) => image.imageType === filter);
  }, [filter, images]);

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">Microscopy</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Image gallery</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                filter === item ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              {item === "life_cycle" ? "Life cycle" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {filtered.map((image) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setActive(image)}
            className="group glass-panel hover-glow mb-4 block w-full overflow-hidden rounded-[1.5rem] text-left"
          >
            <div className="relative h-72">
              <Image
                src={image.imageUrl}
                alt={image.altText || image.caption || "Microscope image"}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-white">{image.caption || image.imageType}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{image.sourceCredit}</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 py-6">
          <div className="glass-panel relative w-full max-w-5xl rounded-[2rem] p-4">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/80"
              aria-label="Close image viewer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative h-[60vh] overflow-hidden rounded-[1.5rem]">
              <Image
                src={active.imageUrl}
                alt={active.altText || active.caption || "Microscope image"}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4">
              <p className="text-lg font-medium text-white">{active.caption}</p>
              <p className="mt-2 text-sm text-slate-300">{active.sourceCredit}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

