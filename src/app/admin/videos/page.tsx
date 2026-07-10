import YouTubeVideoList from "@/components/Sermon/YouTubeVideoList";
import { getYouTubeVideos } from "@/lib/youtube";

export default async function AdminVideosPage() {
  const videos = await getYouTubeVideos();

  return (
    <section className="relative z-10 py-24 md:py-28 lg:py-32">
      <div className="container">
        <div className="mb-12 max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            YouTube Sermons
          </span>
          <h1 className="mb-6 text-4xl font-bold text-dark dark:text-white md:text-5xl">
            Latest YouTube Sermons
          </h1>
          <p className="max-w-2xl text-base text-body-color dark:text-body-color-dark sm:text-lg">
            View the latest 3 videos pulled directly from the configured YouTube channel.
          </p>
        </div>

        <YouTubeVideoList videos={videos} />
      </div>
    </section>
  );
}
