/**
 * Supabase Storage Helper Functions
 * Provides simple, type-safe wrappers for common storage operations
 */

import { supabaseAdmin, StorageBucket, getPublicStorageUrl } from "./supabase-storage";

/**
 * Upload a file to Supabase Storage
 * @param bucket - Storage bucket name (gallery, sermons, pastors, documents)
 * @param file - File to upload
 * @param customPath - Optional custom path (default: auto-generated with timestamp)
 * @returns Object containing publicUrl and storagePath
 */
export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  customPath?: string
): Promise<{ publicUrl: string; storagePath: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`File must be an image, got ${file.type}`);
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error(`File is too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }

  // Generate storage path
  const storagePath =
    customPath ||
    `${Date.now()}-${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}`;

  if (!supabaseAdmin) {
    throw new Error("Supabase storage is not configured.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabaseAdmin.storage.from(bucket).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const publicUrl = getPublicStorageUrl(bucket, storagePath);

  return { publicUrl, storagePath };
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param storagePath - Path of the file to delete
 */
export async function deleteImage(bucket: StorageBucket, storagePath: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error("Supabase storage is not configured.");
  }

  const { error } = await supabaseAdmin.storage.from(bucket).remove([storagePath]);

  if (error) {
    throw error;
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param bucket - Storage bucket name
 * @param storagePaths - Array of file paths to delete
 */
export async function deleteImages(bucket: StorageBucket, storagePaths: string[]): Promise<void> {
  if (storagePaths.length === 0) return;
  if (!supabaseAdmin) {
    throw new Error("Supabase storage is not configured.");
  }

  const { error } = await supabaseAdmin.storage.from(bucket).remove(storagePaths);

  if (error) {
    throw error;
  }
}

/**
 * Get the public URL for a stored file
 * @param bucket - Storage bucket name
 * @param storagePath - Path of the file
 * @returns Public URL that can be used in img src, etc.
 */
export function getPublicUrl(bucket: StorageBucket, storagePath: string): string {
  return getPublicStorageUrl(bucket, storagePath);
}

/**
 * Download a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param storagePath - Path of the file to download
 * @returns Blob of the file
 */
export async function downloadImage(bucket: StorageBucket, storagePath: string): Promise<Blob> {
  if (!supabaseAdmin) {
    throw new Error("Supabase storage is not configured.");
  }

  const { data, error } = await supabaseAdmin.storage.from(bucket).download(storagePath);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Check if a file exists in Supabase Storage
 * @param bucket - Storage bucket name
 * @param storagePath - Path of the file
 * @returns true if file exists, false otherwise
 */
export async function fileExists(bucket: StorageBucket, storagePath: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase storage is not configured.");
    }

    const { data, error } = await supabaseAdmin.storage.from(bucket).list("");

    if (error) {
      throw error;
    }

    return data.some((file) => file.name === storagePath.split("/").pop());
  } catch {
    return false;
  }
}

/**
 * List all files in a bucket or subdirectory
 * @param bucket - Storage bucket name
 * @param path - Optional subdirectory path
 * @returns Array of file objects
 */
export async function listFiles(bucket: StorageBucket, path = "") {
  if (!supabaseAdmin) {
    throw new Error("Supabase storage is not configured.");
  }

  const { data, error } = await supabaseAdmin.storage.from(bucket).list(path);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get storage stats for a bucket
 * @param bucket - Storage bucket name
 * @returns Object with bucket info (requires admin client)
 */
export async function getBucketInfo(bucket: StorageBucket) {
  if (!supabaseAdmin) {
    throw new Error("Supabase storage is not configured.");
  }

  const { data, error } = await supabaseAdmin.storage.getBucket(bucket);

  if (error) {
    throw error;
  }

  return data;
}
