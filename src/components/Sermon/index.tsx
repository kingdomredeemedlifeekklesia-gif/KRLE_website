"use client";
import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import SingleSermon from "./SingleSermon";
import YouTubeVideoCard from "./YouTubeVideoCard";
import sermonData from "./sermonData";
import { getYouTubeVideos, YouTubeVideo } from "@/lib/youtube";

const Sermon = () => {
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    async function fetchVideos() {
      const videos = await getYouTubeVideos(3);
      setYoutubeVideos(videos);
    }
    fetchVideos();
  }, []);

  return (
    <section id="sermon" className="bg-gray-light py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Latest Sermon Streams"
          paragraph="Watch the latest 3 sermon streams from our YouTube channel, with additional uploaded videos available on the sermon page."
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
          {sermonData.slice(0, 3 - youtubeVideos.length).map((sermon) => (
            <div key={sermon.id} className="w-full">
              <SingleSermon sermon={sermon} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sermon;
