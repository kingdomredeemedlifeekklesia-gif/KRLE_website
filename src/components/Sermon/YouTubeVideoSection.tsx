"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/Common/SectionTitle";
import YouTubeVideoCard from "./YouTubeVideoCard";
import { getYouTubeVideos, YouTubeVideo } from "@/lib/youtube";

export default function YouTubeVideoSection() {
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const isYouTubeConfigured = Boolean(
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY &&
    process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  );

  useEffect(() => {
    if (!isYouTubeConfigured) {
      setIsLoaded(true);
      return;
    }

    const fetchVideos = async () => {
      try {
        const videos = await getYouTubeVideos(3);
        setYoutubeVideos(videos.slice(0, 3));
      } catch (error) {
        console.error("YouTube fetch failed:", error);
        setErrorMessage("No sermons available at the moment.");
      } finally {
        setIsLoaded(true);
      }
    };

    fetchVideos();
  }, [isYouTubeConfigured]);

  return (
    <>
      {isLoaded && youtubeVideos.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-dark">YouTube Streams</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {youtubeVideos.map((video) => (
              <YouTubeVideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                publishedAt={video.publishedAt}
              />
            ))}
          </div>
        </div>
      )}

      {isLoaded && youtubeVideos.length === 0 && (
        <div className="text-center text-body-color mb-12">
          {!isYouTubeConfigured ? (
            <p>
              No sermons available because YouTube is not configured. Please set <span className="font-semibold">NEXT_PUBLIC_YOUTUBE_API_KEY</span> and <span className="font-semibold">NEXT_PUBLIC_YOUTUBE_CHANNEL_ID</span> in your environment.
            </p>
          ) : (
            <p>{errorMessage ?? "No sermons available at the moment."}</p>
          )}
        </div>
      )}
    </>
  );
}
