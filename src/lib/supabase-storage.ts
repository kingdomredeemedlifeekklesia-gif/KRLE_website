import { createClient } from "@supabase/supabase-js";

export const STORAGE_BUCKETS = ["gallery", "church-gallery", "sermons", "pastors", "documents"] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_KEY?.trim();

function useSupabaseStorage() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function normalizeStoragePath(filePath: string) {
  return filePath.replace(/^\/+/g, "").replace(/\\/g, "/").split("/").filter(Boolean).join("/");
}

function getLocalPublicUrl(bucket: StorageBucket, filePath: string) {
  const normalizedPath = normalizeStoragePath(filePath);
  return `/uploads/${bucket}/${normalizedPath}`;
}

export const supabaseAdmin = useSupabaseStorage()
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

function getBucketName(bucket: StorageBucket) {
  return bucket === "gallery" ? "church-gallery" : bucket;
}

export async function ensureStorageBuckets() {
  return true;
}

export function getPublicStorageUrl(bucket: StorageBucket, filePath: string) {
  if (!useSupabaseStorage() || !supabaseAdmin) {
    return getLocalPublicUrl(bucket, filePath);
  }

  const resolvedBucket = getBucketName(bucket);
  const { data } = supabaseAdmin.storage.from(resolvedBucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export function getStoragePathFromPublicUrl(bucket: StorageBucket, url: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex !== -1) {
    return decodeURIComponent(url.slice(markerIndex + marker.length));
  }

  const localMarker = `/uploads/${bucket}/`;
  const localMarkerIndex = url.indexOf(localMarker);

  if (localMarkerIndex !== -1) {
    return decodeURIComponent(url.slice(localMarkerIndex + localMarker.length));
  }

  return null;
}

export async function uploadStorageObject(
  bucket: StorageBucket,
  filePath: string,
  buffer: ArrayBuffer | Buffer,
  options?: { contentType?: string; upsert?: boolean }
) {
  const normalizedPath = normalizeStoragePath(filePath);

  if (!useSupabaseStorage() || !supabaseAdmin) {
    return {
      path: normalizedPath,
      publicUrl: getLocalPublicUrl(bucket, normalizedPath),
    };
  }

  const resolvedBucket = getBucketName(bucket);
  const uploadBuffer =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  const { data, error } = await supabaseAdmin.storage.from(resolvedBucket).upload(normalizedPath, uploadBuffer, {
    contentType: options?.contentType || "application/octet-stream",
    upsert: options?.upsert ?? false,
  });

  if (error) {
    throw error;
  }

  const publicUrl = getPublicStorageUrl(bucket, normalizedPath);
  return { path: normalizedPath, publicUrl, publicUrlData: data };
}

export async function deleteStorageObject(bucket: StorageBucket, filePath: string) {
  const normalizedPath = normalizeStoragePath(filePath);

  if (!useSupabaseStorage() || !supabaseAdmin) {
    return;
  }

  const resolvedBucket = getBucketName(bucket);
  const { error } = await supabaseAdmin.storage.from(resolvedBucket).remove([normalizedPath]);

  if (error) {
    throw error;
  }
}

export async function downloadStorageObject(bucket: StorageBucket, filePath: string) {
  const normalizedPath = normalizeStoragePath(filePath);

  if (!useSupabaseStorage() || !supabaseAdmin) {
    return new Blob();
  }

  const resolvedBucket = getBucketName(bucket);
  const { data, error } = await supabaseAdmin.storage.from(resolvedBucket).download(normalizedPath);

  if (error) {
    throw error;
  }

  return data;
}
