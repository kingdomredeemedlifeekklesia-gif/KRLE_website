const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  isLive: boolean;
}

export async function getYouTubeVideos(limit?: number): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    channelId: YOUTUBE_CHANNEL_ID,
    order: "date",
    maxResults: limit ? String(limit) : "12",
    type: "video",
    key: YOUTUBE_API_KEY,
  });

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    const data = await response.json();

    if (!response.ok || !Array.isArray(data.items)) {
      console.error("YouTube API error:", data);
      return [];
    }

    const items = Array.isArray(data.items) ? data.items : [];
    return items.slice(0, limit ?? items.length).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      isLive: (item.snippet?.liveBroadcastContent || "none") !== "none",
    }));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}

export async function getRecentLiveStream(): Promise<YouTubeVideo | null> {
  const videos = await getYouTubeVideos(1);
  return videos[0] ?? null;
}
