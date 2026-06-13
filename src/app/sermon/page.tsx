import Breadcrumb from "@/components/Common/Breadcrumb";
import SectionTitle from "@/components/Common/SectionTitle";
import YouTubeVideoCard from "@/components/Sermon/YouTubeVideoCard";
import SingleSermon from "@/components/Sermon/SingleSermon";
import sermonData from "@/components/Sermon/sermonData";
import { getYouTubeVideos } from "@/lib/youtube";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sermons | Kingdom Redeemed Life Ecclesia",
  description: "Browse recent sermons, teachings, and devotionals from our church community.",
};

const isYouTubeConfigured = Boolean(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY && process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID);

const Blog = async () => {
  const youtubeVideos = await getYouTubeVideos(50);

  return (
    <>
      <Breadcrumb
        pageName="Sermons"
        description="Discover uplifting messages, daily devotions, and spiritual encouragement from our pastors and ministry leaders."
      />

      <section className="pt-[100px] pb-[100px]">
        <div className="container">
          <SectionTitle
            title="All Sermons & Streams"
            paragraph="Watch sermon videos directly from our YouTube channel. Configure your YouTube access to display the latest messages here."
            center
          />

          {youtubeVideos.length > 0 && (
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

          {youtubeVideos.length === 0 && (
            <div className="text-center text-body-color">
              {!isYouTubeConfigured ? (
                <p>
                  No sermons available because YouTube is not configured. Please set <span className="font-semibold">NEXT_PUBLIC_YOUTUBE_API_KEY</span> and <span className="font-semibold">NEXT_PUBLIC_YOUTUBE_CHANNEL_ID</span> in your environment.
                </p>
              ) : (
                <p>
                  No sermons available right now. Make sure your YouTube API key and channel ID are valid, that the YouTube Data API is enabled, and try again shortly.
                </p>
              )}
            </div>
          )}

          {youtubeVideos.length === 0 && (
            <div className="mt-12">
              <SectionTitle
                title="Other Sermons"
                paragraph="While the latest YouTube videos are unavailable, you can still explore recent sermon content below."
                center={false}
              />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {sermonData.map((sermon) => (
                  <div key={sermon.id} className="w-full">
                    <SingleSermon sermon={sermon} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
