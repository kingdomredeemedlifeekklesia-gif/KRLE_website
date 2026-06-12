import { UploadedVideo } from "@/lib/uploadedVideos";

interface UploadedVideoCardProps {
  video: UploadedVideo;
}

export default function UploadedVideoCard({ video }: UploadedVideoCardProps) {
  const date = new Date(video.uploadedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-sm bg-white shadow-three">
      <div className="relative w-full overflow-hidden bg-black">
        <video
          controls
          src={video.url}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-base font-semibold text-black">{video.title}</h3>
        <p className="text-sm text-body-color mb-3 line-clamp-2">{video.description}</p>
        <p className="text-xs text-body-color/70">Uploaded {date}</p>
      </div>
    </div>
  );
}
