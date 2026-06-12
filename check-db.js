const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log('Transactions found:', transactions.length);
    console.log(JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
