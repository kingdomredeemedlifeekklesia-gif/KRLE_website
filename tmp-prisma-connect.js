process.env.DATABASE_URL = 'postgresql://postgres:fQ1RIvdtxpQ85Jdh@db.ecmpgekgclieyswbdwyw.supabase.co:5432/postgres?sslmode=require';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

(async () => {
  try {
    await prisma.$connect();
    console.log('connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
