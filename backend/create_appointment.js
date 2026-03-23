const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find Doctor "Dr. verification Test"
  const doctor = await prisma.doctor.findFirst({
    where: { name: 'Dr. verification Test' }
  });

  if (!doctor) {
    console.log("Doctor not found!");
    return;
  }

  // 2. Create Patient "Test Patient"
  // Needs a User first
  const email = 'testpatient@example.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Patient',
        email,
        password: 'password123',
        role: 'PATIENT'
      }
    });
  }

  let patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name: 'Test Patient',
        email: email,
        phone: '9876543210',
        dob: new Date('1990-01-01'),
        gender: 'MALE'
      }
    });
  }

  // 3. Create Slot
  const slotDate = new Date();
  const startTime = new Date();
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date();
  endTime.setHours(11, 0, 0, 0);

  let slot = await prisma.slot.findFirst({
    where: { doctorId: doctor.id, date: slotDate }
  });

  if (!slot) {
    slot = await prisma.slot.create({
      data: {
        doctorId: doctor.id,
        date: slotDate,
        startTime: startTime,
        endTime: endTime,
        booked: true
      }
    });
  }

  // 4. Create Appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      slotId: slot.id,
      status: 'BOOKED'
    }
  });

  console.log("Created test appointment between Patient and Doctor:", doctor.name);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
