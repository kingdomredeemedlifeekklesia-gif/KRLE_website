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

export async function getYouTubeVideos(limit: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&order=date&maxResults=${limit}&type=video&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 60 } }
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      publishedAt: item.snippet.publishedAt,
      isLive: false,
    }));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}

export async function getRecentLiveStream(): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 60 } }
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      publishedAt: item.snippet.publishedAt,
      isLive: true,
    };
  } catch (error) {
    console.error("Error fetching live stream:", error);
    return null;
  }
}
