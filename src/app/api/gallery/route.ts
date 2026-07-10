import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteStorageObject, getStoragePathFromPublicUrl, uploadStorageObject } from "@/lib/supabase-storage";

const GALLERY_BUCKET = "gallery";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function normalizeUploadedImageUrl(url: string) {
  return url?.startsWith("http") ? url : `https://ecmpgekgclieyswbdwyw.supabase.co/storage/v1/object/public/church-gallery/${encodeURIComponent(url)}`;
}

function sanitizeFilename(filename: string) {
  const extension = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  const basename = filename
    .replace(extension, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${Date.now()}-${crypto.randomUUID()}-${basename || "image"}${extension.toLowerCase()}`;
}

function getStoragePath(image: { filename: string; url: string }) {
  return getStoragePathFromPublicUrl(GALLERY_BUCKET, image.url) ?? image.filename;
}

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        filename: true,
        url: true,
        category: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to load gallery images.",
        details: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (!title || !category || files.length === 0) {
      return NextResponse.json(
        { error: "Title, category, and at least one file are required." },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a valid image file.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      const storagePath = sanitizeFilename(file.name);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await uploadStorageObject(GALLERY_BUCKET, storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      const publicUrl = uploadResult.publicUrl || normalizeUploadedImageUrl(storagePath);

      const image = await prisma.galleryImage.create({
        data: {
          title,
          description: description || null,
          filename: storagePath,
          url: publicUrl,
          category,
        },
        select: {
          id: true,
          title: true,
          description: true,
          filename: true,
          url: true,
          category: true,
          uploadedAt: true,
        },
      });

      uploadedImages.push(image);
    }

    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload images.",
        details: error instanceof Error ? error.message : "Unknown storage error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const queryId = url.searchParams.get("id");
    const body = request.headers.get("content-type")?.includes("application/json")
      ? await request.json().catch(() => null)
      : null;
    const ids = Array.from(
      new Set([...(Array.isArray(body?.ids) ? body.ids : []), ...(queryId ? [queryId] : [])])
    ).filter((id): id is string => typeof id === "string" && id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json({ error: "At least one image ID is required." }, { status: 400 });
    }

    const images = await prisma.galleryImage.findMany({
      where: { id: { in: ids } },
      select: { id: true, filename: true, url: true },
    });

    if (images.length === 0) {
      return NextResponse.json({ error: "No images found." }, { status: 404 });
    }

    const paths = images.map(getStoragePath);

    for (const storagePath of paths) {
      try {
        await deleteStorageObject(GALLERY_BUCKET, storagePath);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!/not found|does not exist|object.*not/i.test(message)) {
          throw error;
        }
      }
    }

    await prisma.galleryImage.deleteMany({
      where: { id: { in: images.map((image) => image.id) } },
    });

    return NextResponse.json({ message: "Images deleted successfully", deletedIds: images.map((image) => image.id) });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete image.",
        details: error instanceof Error ? error.message : "Unknown storage error",
      },
      { status: 500 }
    );
  }
}
