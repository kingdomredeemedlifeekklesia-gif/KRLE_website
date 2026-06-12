"use client";

import { useEffect, useState } from "react";

interface UploadedVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  uploadedAt: string;
}

export default function VideoUploader() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);

  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setUploadedVideos(data);
    }
    fetchVideos();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setStatus("Please select a video file.");
      return;
    }
    setStatus("Uploading...");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileName: file.name,
          fileType: file.type,
          base64,
        }),
      });

      if (!response.ok) {
        setStatus("Upload failed. Please try again.");
        return;
      }

      const video = await response.json();
      setUploadedVideos((prev) => [video, ...prev]);
      setTitle("");
      setDescription("");
      setFile(null);
      setStatus("Upload successful.");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-body-color/10 bg-white p-8 shadow-three">
        <h2 className="mb-4 text-2xl font-semibold text-dark">Upload Sermon Video</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xs border border-body-color/10 bg-[#FCFCFC] px-4 py-3 text-body-color outline-none focus:border-primary"
              placeholder="Enter video title"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xs border border-body-color/10 bg-[#FCFCFC] px-4 py-3 text-body-color outline-none focus:border-primary"
              placeholder="Enter a short description"
              rows={4}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-body-color"
            />
          </div>
          <button
            type="submit"
            className="rounded-xs bg-primary px-6 py-3 text-white transition hover:bg-primary/90"
          >
            Upload Video
          </button>
          {status && <p className="text-sm text-body-color">{status}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-body-color/10 bg-white p-8 shadow-three">
        <h2 className="mb-4 text-2xl font-semibold text-dark">Uploaded Videos</h2>
        <div className="space-y-4">
          {uploadedVideos.length === 0 && <p className="text-body-color">No uploaded videos yet.</p>}
          {uploadedVideos.map((video) => (
            <div key={video.id} className="rounded-sm border border-body-color/10 p-4">
              <p className="font-semibold text-dark">{video.title}</p>
              <p className="text-sm text-body-color">{video.description}</p>
              <p className="text-xs text-body-color/70">Uploaded {new Date(video.uploadedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
