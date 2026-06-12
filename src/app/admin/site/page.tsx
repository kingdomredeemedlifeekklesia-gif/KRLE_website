"use client";

import { useState } from "react";

const SiteManagementPage = () => {
  const [heroTitle, setHeroTitle] = useState("Welcome to Kingdom Redeemed Life Ecclesia");
  const [heroSubtitle, setHeroSubtitle] = useState("A place of worship, fellowship, and spiritual growth");
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleSave = () => {
    // Mock save functionality
    alert("Changes saved!");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    // Mock upload - in real app, upload to server
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleDeleteImage = (id) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
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
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative">
                <img src={image.url} alt={image.name} className="w-full h-32 object-cover rounded" />
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-white rounded hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteManagementPage;