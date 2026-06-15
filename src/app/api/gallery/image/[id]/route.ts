import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";

export async function GET(request: Request, context: any) {
  try {
    // Next.js may provide params directly or as a Promise - handle both.
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Image ID is required." }, { status: 400 });
    }

    const image = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    if (!image.imageBlob) {
      return NextResponse.json({ error: "No image content available." }, { status: 404 });
    }

    const extension = path.extname(image.filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (extension === ".jpg" || extension === ".jpeg") contentType = "image/jpeg";
    else if (extension === ".png") contentType = "image/png";
    else if (extension === ".gif") contentType = "image/gif";
    else if (extension === ".webp") contentType = "image/webp";
    else if (extension === ".svg") contentType = "image/svg+xml";

    // Convert Prisma Bytes/Buffer to a BodyInit-compatible type for NextResponse
    const raw = image.imageBlob as unknown;
    const bodyBuffer = (raw instanceof Buffer) ? raw : Buffer.from(raw as any);

    return new NextResponse(bodyBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${image.filename}"`,
      },
    });
  } catch (error) {
    console.error("Gallery image stream error:", error);
    return NextResponse.json({ error: "Failed to load image." }, { status: 500 });
  }
}