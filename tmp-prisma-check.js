const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.galleryImage.findMany({
      select: { id: true, filename: true, url: true, category: true, uploadedAt: true },
      take: 5,
    });
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
