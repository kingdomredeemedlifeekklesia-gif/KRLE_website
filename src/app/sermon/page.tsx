import Breadcrumb from "@/components/Common/Breadcrumb";
import SectionTitle from "@/components/Common/SectionTitle";
import YouTubeVideoList from "@/components/Sermon/YouTubeVideoList";
import { Metadata } from "next";
import { getYouTubeVideos } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Sermons | Kingdom Redeemed Life Ecclesia",
  description: "Browse recent sermons, teachings, and devotionals from our church community.",
};

const isYouTubeConfigured = Boolean(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY && process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID);

const Blog = async () => {
  const videos = isYouTubeConfigured ? await getYouTubeVideos(50) : [];

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

          <YouTubeVideoList videos={videos} />

        </div>
      </section>
    </>
  );
};

export default Blog;
