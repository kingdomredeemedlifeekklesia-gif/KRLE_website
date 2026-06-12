import { prisma } from './src/lib/prisma';

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
