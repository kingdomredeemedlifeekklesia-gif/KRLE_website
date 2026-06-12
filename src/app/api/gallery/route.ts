import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load gallery images." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("Gallery upload request received");

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const files = formData.getAll("files") as File[];

    console.log("Form data:", { title, description, category, fileCount: files.length });

    if (!title || !category || files.length === 0) {
      console.log("Validation failed:", { title: !!title, category: !!category, files: files.length });
      return NextResponse.json({
        error: "Title, category, and at least one file are required."
      }, { status: 400 });
    }

    const uploadedImages = [];

    // Ensure uploads/gallery directory exists
    const galleryDir = path.join(process.cwd(), "public", "uploads", "gallery");
    console.log("Gallery directory:", galleryDir);
    try {
      await mkdir(galleryDir, { recursive: true });
      console.log("Gallery directory created or already exists");
    } catch (error) {
      console.error("Error creating gallery directory:", error);
      // Directory might already exist, continue
    }

    for (const file of files) {
      if (!(file instanceof File)) {
        console.log("Skipping non-file item:", typeof file);
        continue;
      }

      console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log("Invalid file type:", file.type);
        return NextResponse.json({
          error: `File "${file.name}" is not a valid image file.`
        }, { status: 400 });
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log("File too large:", file.size);
        return NextResponse.json({
          error: `File "${file.name}" is too large. Maximum size is 10MB.`
        }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = path.extname(file.name);
      const filename = `${timestamp}-${random}${extension}`;
      const filepath = path.join(galleryDir, filename);

      console.log("Saving file to:", filepath);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      console.log("File saved successfully, saving to database");

      // Save to database
      const image = await prisma.galleryImage.create({
        data: {
          title,
          description: description || null,
          filename,
          url: `/uploads/gallery/${filename}`,
          category,
        },
      });

      console.log("Database record created:", image.id);
      uploadedImages.push(image);
    }

    console.log("Upload completed successfully, uploaded", uploadedImages.length, "images");
    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload images." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Image ID is required." }, { status: 400 });
    }

    const image = await prisma.galleryImage.delete({
      where: { id },
    });

    // TODO: Optionally delete the actual file from filesystem

    return NextResponse.json({ message: "Image deleted successfully", image });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete image." }, { status: 500 });
  }
}