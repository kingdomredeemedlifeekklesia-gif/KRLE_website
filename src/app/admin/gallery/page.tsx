"use client";

import { useEffect, useState } from "react";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  url: string;
  category: string;
  uploadedAt: string;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("programs");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gallery");
      if (!response.ok) {
        throw new Error("Failed to load gallery images.");
      }
      const data: GalleryImage[] = await response.json();
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load gallery images.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selection changed:", e.target.files);
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Upload form submitted");
    console.log("Selected files:", selectedFiles);

    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);

      console.log("Form data prepared:", { title, description, category });

      for (let i = 0; i < selectedFiles.length; i++) {
        console.log("Adding file:", selectedFiles[i].name, "Size:", selectedFiles[i].size);
        formData.append("files", selectedFiles[i]);
      }

      console.log("Sending request to /api/gallery");

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.error || "Failed to upload images.");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      setTitle("");
      setDescription("");
      setCategory("programs");
      setSelectedFiles(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setShowUploadForm(false);
      await fetchImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image.");
      }

      await fetchImages();
    } catch (err) {
      setError("Failed to delete image.");
    }
  };

  const handleSelectImage = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.size === 0) {
      alert("Please select images to download.");
      return;
    }

    try {
      const response = await fetch("/api/gallery/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: Array.from(selectedImages) }),
      });

      if (!response.ok) {
        throw new Error("Failed to download images.");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gallery-images-${new Date().toISOString().split("T")[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download images.");
    }
  };

  const handleDownloadSingle = async (image: GalleryImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.filename;
    link.click();
  };

  const categories = ["programs", "services", "events", "ministry", "community", "other"];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Gallery Management
      </h1>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-300">
          ✗ {error}
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          {showUploadForm ? "Cancel Upload" : "Upload Images"}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload Gallery Images
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Image Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {selectedFiles && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
          </form>
        </div>
      )}

      {/* Bulk Actions */}
      {images.length > 0 && (
        <div className="mb-6 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedImages.size === images.length && images.length > 0}
              onChange={handleSelectAll}
              className="mr-2"
            />
            Select All
          </label>
          {selectedImages.size > 0 && (
            <button
              onClick={handleDownloadSelected}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download Selected ({selectedImages.size})
            </button>
          )}
        </div>
      )}

      {/* Images Grid */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Gallery Images ({images.length})
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading images...</p>
        ) : images.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No images have been uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => handleSelectImage(image.id)}
                    className="absolute top-2 left-2 z-10"
                  />
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {image.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {image.category}
                  </p>
                  {image.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {image.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadSingle(image)}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id, image.filename)}
                      className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;