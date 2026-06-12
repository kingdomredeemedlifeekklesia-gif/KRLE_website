import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const paymentCount = await prisma.paymentTransaction.count();
    const membersCount = await prisma.communityMember.count();
    const messageCount = await prisma.contactMessage.count();
    console.log({ paymentCount, membersCount, messageCount });
  } catch (error) {
    console.error("Prisma test error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
