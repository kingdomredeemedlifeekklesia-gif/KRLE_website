import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

export async function GET() {
  const videos = await prisma.uploadedVideo.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { title, description, fileName, fileType, base64 } = body;
  if (!title || !fileName || !base64) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await ensureUploadsDir();

  const safeFileName = path.basename(fileName);
  const fileBuffer = Buffer.from(base64, "base64");
  const filePath = path.join(uploadsDir, safeFileName);
  await fs.writeFile(filePath, fileBuffer);

  const newVideo = await prisma.uploadedVideo.create({
    data: {
      title,
      description: description || "",
      filename: safeFileName,
      url: `/uploads/${safeFileName}`,
    },
  });

  return NextResponse.json(newVideo, { status: 201 });
}
