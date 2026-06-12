import { prisma } from "@/lib/prisma";

export interface UploadedVideo {
  id: string;
  title: string;
  description: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

export async function getUploadedVideos(): Promise<UploadedVideo[]> {
  const videos = await prisma.uploadedVideo.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  return videos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    filename: video.filename,
    url: video.url,
    uploadedAt: video.uploadedAt.toISOString(),
  }));
}

export async function addUploadedVideo(video: Omit<UploadedVideo, "id" | "uploadedAt">) {
  const created = await prisma.uploadedVideo.create({
    data: {
      title: video.title,
      description: video.description,
      filename: video.filename,
      url: video.url,
    },
  });

  return {
    id: created.id,
    title: created.title,
    description: created.description,
    filename: created.filename,
    url: created.url,
    uploadedAt: created.uploadedAt.toISOString(),
  };
}
