"use client";

import { useState, type ChangeEvent } from "react";
import { uploadImage, deleteImage } from "@/lib/supabase-helpers";

type UploadedImage = {
  id: string;
  name: string;
  url: string;
  storagePath: string;
};

const SiteManagementPage = () => {
  const [heroTitle, setHeroTitle] = useState("Welcome to Kingdom Redeemed Life Ecclesia");
  const [heroSubtitle, setHeroSubtitle] = useState("A place of worship, fellowship, and spiritual growth");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    alert("Changes saved!");
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const newImages: UploadedImage[] = [];

      for (const file of files) {
        try {
          const { publicUrl, storagePath } = await uploadImage("gallery", file);
          newImages.push({
            id: crypto.randomUUID(),
            name: file.name,
            url: publicUrl,
            storagePath,
          });
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          setError(`Failed to upload ${file.name}`);
        }
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      event.target.value = ""; // Reset file input
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string, storagePath: string) => {
    if (!confirm("Delete this image?")) return;

    try {
      setError("");
      await deleteImage("gallery", storagePath);
      setUploadedImages(uploadedImages.filter(img => img.id !== id));
    } catch (err) {
      setError(`Failed to delete image: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Site Management</h1>

      <div className="space-y-8">
        {/* Hero Section Editing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle</label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Image Gallery</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
              ✗ {error}
            </div>
          )}

          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Uploading to Supabase Storage...</p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img src={image.url} alt={image.name} className="w-full h-32 object-cover rounded" />
                <button
                  onClick={() => handleDeleteImage(image.id, image.storagePath)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate" title={image.name}>
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-6 py-3 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteManagementPage;