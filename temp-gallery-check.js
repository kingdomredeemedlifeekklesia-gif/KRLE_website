const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

process.env.DATABASE_URL = 'postgresql://postgres:FcwOciNOspWnjLabUGYewlSSlsfAYOKh@postgres.railway.internal:5432/railway';

const prisma = new PrismaClient();

(async () => {
  try {
    const images = await prisma.galleryImage.findMany({ take: 5 });
    console.log('COUNT', images.length);
    for (const img of images) {
      const file = path.join(process.cwd(), 'public', img.url);
      console.log(JSON.stringify({ id: img.id, url: img.url, file, exists: fs.existsSync(file) }, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
