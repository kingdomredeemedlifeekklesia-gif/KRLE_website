"use client";
import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import YouTubeVideoCard from "./YouTubeVideoCard";
import { getYouTubeVideos, YouTubeVideo } from "@/lib/youtube";

interface SermonSectionProps {
  limit?: number;
}

const Sermon = ({ limit = 3 }: SermonSectionProps) => {
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const videos = await getYouTubeVideos(limit);
        setYoutubeVideos(videos);
      } catch (err) {
        console.error("Failed to fetch YouTube videos:", err);
        setError("No sermons available at the moment.");
      } finally {
        setLoaded(true);
      }
    }

    fetchVideos();
  }, [limit]);

  return (
    <section id="sermon" className="bg-gray-light py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Latest Sermon Streams"
          paragraph="Watch the latest 3 sermon videos from our YouTube channel."
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
          {youtubeVideos.map((video) => (
            <div key={video.id} className="w-full">
              <YouTubeVideoCard
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                publishedAt={video.publishedAt}
              />
            </div>
          ))}
        </div>
        {!loaded && (
          <div className="text-center py-8">Loading latest sermons...</div>
        )}
        {loaded && youtubeVideos.length === 0 && (
          <div className="text-center py-8">{error ?? "No sermons available"}</div>
        )}
      </div>
    </section>
  );
};

export default Sermon;
