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

    for (const image of images) {
      const imagePath = path.join(process.cwd(), "public", image.url);
      try {
        const imageBuffer = fs.readFileSync(imagePath);
        zip.file(image.filename, imageBuffer);
      } catch (error) {
        console.error(`Failed to read image ${image.filename}:`, error);
        // Continue with other images
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return ZIP file
    return new NextResponse(zipBuffer, {
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