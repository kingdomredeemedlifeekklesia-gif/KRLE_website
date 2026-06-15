import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { imageIds }: { imageIds: string[] } = await request.json();

    if (!imageIds || imageIds.length === 0) {
      return NextResponse.json({ error: "No image IDs provided." }, { status: 400 });
    }

    // Fetch images from database
    const images = await prisma.galleryImage.findMany({
      where: {
        id: {
          in: imageIds,
        },
      },
    });

    if (images.length === 0) {
      return NextResponse.json({ error: "No images found." }, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();

    let filesAdded = 0;
    for (const image of images) {
      // Ensure we don't treat a leading slash as an absolute path segment
      const relativeUrl = image.url?.replace(/^\/+/, "") || image.filename;
      const imagePath = path.join(process.cwd(), "public", relativeUrl);
      try {
        if (!fs.existsSync(imagePath)) {
          console.warn(`Image file not found on disk: ${imagePath}`);
          if (image.imageBlob) {
            zip.file(image.filename, image.imageBlob);
            filesAdded++;
            continue;
          }
          continue;
        }
        const imageBuffer = fs.readFileSync(imagePath);
        zip.file(image.filename, imageBuffer);
        filesAdded++;
      } catch (error) {
        console.error(`Failed to read image ${image.filename}:`, error);
        // Continue with other images
      }
    }

    if (filesAdded === 0) {
      return NextResponse.json({ error: "No image files available for download." }, { status: 404 });
    }

    // Generate ZIP file as a Blob-compatible body
    const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const zipBlob = new Blob([zipArrayBuffer]);

    // Return ZIP file
    return new NextResponse(zipBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="gallery-images-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to create download." }, { status: 500 });
  }
}