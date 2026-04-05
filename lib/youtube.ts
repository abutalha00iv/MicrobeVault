import { cacheGet, cacheSet } from "@/lib/redis";

export async function fetchYoutubeVideos(searchTerm: string) {
  const cacheKey = `youtube:${searchTerm.toLowerCase()}`;
  const cached = await cacheGet<unknown[]>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return [];
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", `${searchTerm} microbiology`);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "4");
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 }
  });

  if (!response.ok) {
    throw new Error("YouTube API request failed.");
  }

  const json = await response.json();
  const items =
    json.items?.map((item: Record<string, any>) => ({
      youtubeVideoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      duration: "Unknown"
    })) || [];

  await cacheSet(cacheKey, items, 86400);
  return items;
}
