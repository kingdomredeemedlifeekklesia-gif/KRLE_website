"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  url: string;
  category: string;
  uploadedAt: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeLightbox();
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    if (lightboxImage) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [lightboxImage]);

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
      console.error("Failed to load images:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === "all"
    ? images
    : images.filter(img => img.category === selectedCategory);

  const categories = ["all", ...Array.from(new Set(images.map(img => img.category)))];

  const handleSelectImage = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
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
      alert("Failed to download images. Please try again.");
    }
  };

  const handleDownloadSingle = (image: GalleryImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.filename;
    link.click();
  };

  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl mb-4">
            Our Gallery
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark">
            Browse through photos from our programs, services, and ministry activities.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Bulk Download */}
        {selectedImages.size > 0 && (
          <div className="text-center mb-8">
            <button
              onClick={handleDownloadSelected}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Download Selected ({selectedImages.size}) Images
            </button>
          </div>
        )}

        {/* Images Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Loading gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory === "all"
                ? "No images available yet."
                : `No images in the ${selectedCategory} category.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => handleSelectImage(image.id)}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                  />
                </div>

                {/* Image */}
                <div
                  className="relative h-64 cursor-pointer"
                  onClick={() => setLightboxImage(image)}
                  aria-label={`View ${image.title}`}
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-300"
                  />
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {image.title}
                  </h3>
                  <p className="text-sm text-primary mb-2 capitalize">
                    {image.category}
                  </p>
                  {image.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {image.description}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(image);
                    }}
                    className="w-full px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors"
                  >
                    Download Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            onClick={handleOverlayClick}
          >
            <div
              className="relative max-w-4xl max-h-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              >
                ×
              </button>
              <div className="relative rounded-lg bg-black p-4">
                <Image
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                <div className="mt-4 text-white">
                  <h3 className="text-xl font-semibold mb-2">{lightboxImage.title}</h3>
                  {lightboxImage.description && (
                    <p className="text-gray-300 mb-2">{lightboxImage.description}</p>
                  )}
                  <p className="text-sm text-gray-400 capitalize">
                    Category: {lightboxImage.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;