const { prisma } = require('./src/lib/prisma.ts');

async function testDB() {
  try {
    const count = await prisma.galleryImage.count();
    console.log('Gallery images count:', count);

    // Try to create a test record
    const testImage = await prisma.galleryImage.create({
      data: {
        title: 'Test Image',
        filename: 'test.jpg',
        url: '/uploads/gallery/test.jpg',
        category: 'test',
      },
    });
    console.log('Test image created:', testImage.id);

    // Clean up
    await prisma.galleryImage.delete({ where: { id: testImage.id } });
    console.log('Test image deleted');

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();