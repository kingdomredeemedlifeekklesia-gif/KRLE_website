"use client";

interface YouTubeVideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export default function YouTubeVideoCard({ id, title, thumbnail, publishedAt }: YouTubeVideoCardProps) {
  const date = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-sm bg-white shadow-three hover:shadow-one transition-shadow">
      <div className="relative w-full pb-[56.25%] overflow-hidden bg-gray-200">
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <svg className="h-6 w-6 fill-red-600" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </a>
      </div>
      <div className="p-4">
        <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-black hover:text-primary transition-colors">
            {title}
          </h3>
        </a>
        <p className="text-sm text-body-color">{date}</p>
      </div>
    </div>
  );
}
