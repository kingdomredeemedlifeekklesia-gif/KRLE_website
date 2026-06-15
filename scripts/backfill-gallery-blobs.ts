import { PrismaClient } from '@prisma/client';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const galleryDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
  console.log('Scanning gallery directory:', galleryDir);

  let files: string[] = [];
  try {
    files = await readdir(galleryDir);
  } catch (err) {
    console.error('Failed to read gallery directory:', err);
    process.exit(1);
  }

  let updated = 0;
  for (const filename of files) {
    try {
      // filename is not a unique key in the schema, use findFirst
      const image = await prisma.galleryImage.findFirst({ where: { filename } });
      if (!image) {
        console.log('No DB record for file, skipping:', filename);
        continue;
      }
      if (image.imageBlob) {
        console.log('Image already has blob, skipping:', filename);
        continue;
      }

      const filePath = path.join(galleryDir, filename);
      const buffer = await readFile(filePath);

      await prisma.galleryImage.update({
        where: { id: image.id },
        data: { imageBlob: buffer },
      });
      console.log('Updated image blob for:', filename);
      updated++;
    } catch (err) {
      console.error('Error processing file', filename, err);
    }
  }

  console.log(`Backfill complete. Files scanned: ${files.length}, updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
