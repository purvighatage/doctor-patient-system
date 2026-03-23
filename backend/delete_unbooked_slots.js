const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.slot.deleteMany({
    where: {
      booked: false,
      appointments: { none: {} } // safety guard for foreign key
    }
  });
  console.log(`Successfully deleted ${result.count} unbooked slots safely.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
