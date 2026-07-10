import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Image ID is required." }, { status: 400 });
    }

    const image = await prisma.galleryImage.findUnique({
      where: { id },
      select: { url: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.redirect(image.url);
  } catch (error) {
    console.error("Gallery image redirect error:", error);
    return NextResponse.json({ error: "Failed to load image." }, { status: 500 });
  }
}
