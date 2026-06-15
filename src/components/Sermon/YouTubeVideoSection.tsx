"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/Common/SectionTitle";
import YouTubeVideoCard from "./YouTubeVideoCard";
import sermonData from "./sermonData";
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
        const videos = await getYouTubeVideos(50);
        setYoutubeVideos(videos);
      } catch (error) {
        console.error("YouTube fetch failed:", error);
        setErrorMessage(
          "Unable to fetch YouTube videos right now. Please check your API key and channel settings."
        );
      } finally {
        setIsLoaded(true);
      }
    };

    fetchVideos();
  }, [isYouTubeConfigured]);

  return (
    <>
      <SectionTitle
        title="All Sermons & Streams"
        paragraph="Watch sermon videos directly from our YouTube channel. Configure your YouTube access to display the latest messages here."
        center
      />

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
          ) : errorMessage ? (
            <p>{errorMessage}</p>
          ) : (
            <p>
              No sermons available right now. Make sure your YouTube API key and channel ID are valid, that the YouTube Data API is enabled, and try again shortly.
            </p>
          )}
        </div>
      )}

      {isLoaded && youtubeVideos.length === 0 && (
        <div className="mt-12">
          <SectionTitle
            title="Other Sermons"
            paragraph="While the latest YouTube videos are unavailable, you can still explore recent sermon content below."
            center={false}
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {sermonData.map((sermon) => (
              <div key={sermon.id} className="w-full">
                <YouTubeVideoCard
                  id={sermon.id}
                  title={sermon.title}
                  thumbnail={sermon.image}
                  publishedAt={sermon.publishDate}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
