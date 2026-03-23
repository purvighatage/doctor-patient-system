const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctorUser = await prisma.user.findFirst({
    where: { role: 'DOCTOR' }
  });

  if (doctorUser) {
    const updated = await prisma.user.update({
      where: { id: doctorUser.id },
      data: { mustChangePassword: true }
    });
    console.log(`DOCTOR_EMAIL=${doctorUser.email}`);
    console.log(`DOCTOR_ID=${doctorUser.id}`);
    console.log(`Please use their existing password to test redirects.`);
  } else {
    console.log('No doctor found to set mustChangePassword');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
