const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctor.findMany();
  console.log('Doctors Count:', doctors.length);
  console.log(JSON.stringify(doctors, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
