"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";

type VideoItem = {
  id: string;
  youtubeVideoId: string;
  title: string;
  channelTitle?: string | null;
  duration?: string | null;
  thumbnailUrl?: string | null;
};

export function VideoGallery({
  videos,
  query,
  microbeId
}: {
  videos: VideoItem[];
  query?: string;
  microbeId?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(videos);

  useEffect(() => {
    if (items.length || (!query && !microbeId)) return;

    const params = microbeId ? `microbeId=${microbeId}` : `term=${encodeURIComponent(query || "")}`;
    fetch(`/api/youtube/fetch?${params}`)
      .then((response) => response.json())
      .then((json) => setItems(json.videos || []))
      .catch(() => undefined);
  }, [items.length, microbeId, query]);

  if (!items.length) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Media</p>
        <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">Educational videos</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {items.slice(0, 4).map((video) => (
          <div key={video.id} className="glass-panel overflow-hidden rounded-[1.75rem]">
            {activeId === video.id ? (
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <button type="button" onClick={() => setActiveId(video.id)} className="group relative block aspect-video w-full">
                <Image
                  src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-slate-950/75 px-4 py-2 text-sm text-white">
                    <PlayCircle className="h-5 w-5 text-cyan" />
                    Watch
                  </span>
                </div>
              </button>
            )}
            <div className="space-y-2 p-5">
              <p className="text-lg font-medium text-white">{video.title}</p>
              <p className="text-sm text-slate-300">
                {video.channelTitle || "Educational channel"}
                {video.duration ? ` • ${video.duration}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
