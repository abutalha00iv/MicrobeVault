import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchYoutubeVideos } from "@/lib/youtube";
import { requireAdmin, logActivity } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const term = request.nextUrl.searchParams.get("term");
    const microbeId = request.nextUrl.searchParams.get("microbeId");

    if (!term && !microbeId) {
      return NextResponse.json({ error: "Provide term or microbeId." }, { status: 400 });
    }

    let query = term || "";
    if (microbeId) {
      const microbe = await db.microbe.findUnique({ where: { id: microbeId } });
      query = microbe?.scientificName || query;
    }

    const videos = await fetchYoutubeVideos(query);
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "YouTube fetch failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { microbeId } = await request.json();
  const microbe = await db.microbe.findUnique({ where: { id: microbeId } });
  if (!microbe) {
    return NextResponse.json({ error: "Microbe not found." }, { status: 404 });
  }

  const videos = await fetchYoutubeVideos(microbe.scientificName);
  await db.microbeVideo.deleteMany({ where: { microbeId } });
  if (videos.length) {
    await db.microbeVideo.createMany({
      data: videos.map((video: any) => ({
        microbeId,
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl
      }))
    });
  }

  await logActivity({
    adminId: auth.admin.id,
    action: "FETCH",
    entityType: "youtube_videos",
    entityId: microbeId,
    description: `Fetched YouTube videos for ${microbe.scientificName}`
  });

  return NextResponse.json({ videos });
}

