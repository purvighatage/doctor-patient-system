const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: { select: { name: true, email: true } },
      doctor: { select: { id: true, name: true, userId: true } },
      slot: true
    }
  });

  console.log('--- ALL APPOINTMENTS ---');
  appointments.forEach(a => {
    console.log(`ID: ${a.id}`);
    console.log(`Patient: ${a.patient.name} (${a.patientId})`);
    console.log(`Doctor: ${a.doctor.name} (DocID: ${a.doctor.id}, UserID: ${a.doctor.userId})`);
    console.log(`Slot Date: ${a.slot.date}`);
    console.log(`Slot Start: ${a.slot.startTime}`);
    console.log(`Status: ${a.status}`);
    console.log('------------------------');
  });

  const doctors = await prisma.doctor.findMany();
  console.log('\n--- ALL DOCTORS ---');
  doctors.forEach(d => {
    console.log(`ID: ${d.id}, Name: ${d.name}, UserID: ${d.userId}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
