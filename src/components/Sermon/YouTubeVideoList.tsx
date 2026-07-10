"use client";

import YouTubeVideoCard from "./YouTubeVideoCard";
import { YouTubeVideo } from "@/lib/youtube";

interface YouTubeVideoListProps {
  videos: YouTubeVideo[];
}

export default function YouTubeVideoList({ videos }: YouTubeVideoListProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="py-10 text-center text-body-color dark:text-body-color-dark">
        No sermons available
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold text-dark dark:text-white">YouTube Streams</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
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
  );
}
