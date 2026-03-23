const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.doctor.findFirst({ where: { name: 'Dr. Anjali Mehta' } });
  if (!doctor) {
    console.log('Doctor not found');
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2); // 2 days from now
  tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

  const slot = await prisma.slot.create({
    data: {
      doctorId: doctor.id,
      date: tomorrow,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 30 * 60000), // 30 mins later
      booked: false
    }
  });

  console.log(`Created slot ID ${slot.id} for ${doctor.name} on ${tomorrow.toLocaleDateString()}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
