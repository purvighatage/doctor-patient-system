const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Migrating existing users to Multi-Hospital architecture...');
  
  // 1. Find all admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  
  if (admins.length === 0) {
    console.log('No admins found.');
    return;
  }

  let defaultHospital = null;

  // 2. Ensure every admin has a hospital
  for (const admin of admins) {
    const existingHospital = await prisma.hospital.findUnique({ where: { adminId: admin.id } });
    if (!existingHospital) {
      const hospitalName = `${admin.name || 'Default'} Hospital`;
      const newHospital = await prisma.hospital.create({
        data: {
          name: hospitalName,
          address: '123 Health Ave, City, State ZIP',
          phone: '1-800-HOSPITAL',
          adminId: admin.id
        }
      });
      console.log(`Created new hospital "${hospitalName}" for Admin ${admin.email}`);
      if (!defaultHospital) defaultHospital = newHospital;
    } else {
      if (!defaultHospital) defaultHospital = existingHospital;
    }
  }

  // 3. Ensure all existing doctors are assigned to a hospital
  if (defaultHospital) {
    const doctorsWithoutHospital = await prisma.doctor.findMany({ where: { hospitalId: null } });
    if (doctorsWithoutHospital.length > 0) {
      const updateResult = await prisma.doctor.updateMany({
        where: { hospitalId: null },
        data: { hospitalId: defaultHospital.id }
      });
      console.log(`Assigned ${updateResult.count} existing doctors to the default hospital.`);
    } else {
      console.log('All doctors already have a hospital assigned.');
    }
  }

  console.log('Migration complete.');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
