import Breadcrumb from "@/components/Common/Breadcrumb";
import SectionTitle from "@/components/Common/SectionTitle";
import YouTubeVideoCard from "@/components/Sermon/YouTubeVideoCard";
import { getYouTubeVideos } from "@/lib/youtube";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sermons | Kingdom Redeemed Life Ecclesia",
  description: "Browse recent sermons, teachings, and devotionals from our church community.",
};

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
            <p className="text-center text-body-color">
              No sermons available right now. Please make sure your YouTube API key and channel ID are configured, or check back later.
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
