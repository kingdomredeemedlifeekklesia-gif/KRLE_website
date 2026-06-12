export default function AdminVideosPage() {
  return (
    <section className="relative z-10 py-24 md:py-28 lg:py-32">
      <div className="container">
        <div className="mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            YouTube Sermons
          </span>
          <h1 className="mb-6 text-4xl font-bold text-dark md:text-5xl">
            YouTube Sermon Integration
          </h1>
          <p className="mx-auto max-w-2xl text-base text-body-color sm:text-lg">
            The sermon page now displays videos directly from your YouTube channel. Remove the old upload video workflow and configure the YouTube API settings in your environment.
          </p>
        </div>
        <div className="rounded-xl border border-body-color/10 bg-white p-8 shadow-three">
          <h2 className="mb-4 text-2xl font-semibold text-dark">Setup Instructions</h2>
          <ol className="list-decimal space-y-3 pl-5 text-body-color">
            <li>Add your YouTube API key to <code className="rounded bg-slate-100 px-2 py-1">NEXT_PUBLIC_YOUTUBE_API_KEY</code>.</li>
            <li>Add your YouTube channel ID to <code className="rounded bg-slate-100 px-2 py-1">NEXT_PUBLIC_YOUTUBE_CHANNEL_ID</code>.</li>
            <li>Restart the app after updating environment variables.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
