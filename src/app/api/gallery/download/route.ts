import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadStorageObject, getStoragePathFromPublicUrl } from "@/lib/supabase-storage";
import JSZip from "jszip";

const GALLERY_BUCKET = "gallery";

function getStoragePath(image: { filename: string; url: string }) {
  return getStoragePathFromPublicUrl(GALLERY_BUCKET, image.url) ?? image.filename;
}

async function blobToArrayBuffer(blob: Blob) {
  return blob.arrayBuffer();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Image ID is required." }, { status: 400 });
    }

    const image = await prisma.galleryImage.findUnique({
      where: { id },
      select: { filename: true, url: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    const blob = await downloadStorageObject(GALLERY_BUCKET, getStoragePath(image));

    return new NextResponse(blob, {
      headers: {
        "Content-Type": blob.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${image.filename.split("/").pop() ?? "gallery-image"}"`,
      },
    });
  } catch (error) {
    console.error("Single image download error:", error);
    return NextResponse.json({ error: "Failed to download image." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageIds }: { imageIds?: string[] } = await request.json();

    if (!imageIds || imageIds.length === 0) {
      return NextResponse.json({ error: "No image IDs provided." }, { status: 400 });
    }

    const images = await prisma.galleryImage.findMany({
      where: { id: { in: imageIds } },
      select: { filename: true, url: true },
    });

    if (images.length === 0) {
      return NextResponse.json({ error: "No images found." }, { status: 404 });
    }

    const zip = new JSZip();
    let filesAdded = 0;

    for (const image of images) {
      try {
        const blob = await downloadStorageObject(GALLERY_BUCKET, getStoragePath(image));
        const filename = image.filename.split("/").pop() ?? image.filename;
        zip.file(filename, await blobToArrayBuffer(blob));
        filesAdded++;
      } catch (error) {
        console.error(`Failed to add image ${image.filename} to ZIP:`, error);
      }
    }

    if (filesAdded === 0) {
      return NextResponse.json({ error: "No image files available for download." }, { status: 404 });
    }

    const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

    return new NextResponse(zipArrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="gallery-images-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error("Bulk image download error:", error);
    return NextResponse.json({ error: "Failed to create download." }, { status: 500 });
  }
}
