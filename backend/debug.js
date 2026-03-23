const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log("=== Admins ===");
  console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email })));

  const hospitals = await prisma.hospital.findMany({ include: { admin: { select: { name: true, email: true } } } });
  console.log("\n=== Hospitals ===");
  console.log(hospitals.map(h => ({ id: h.id, name: h.name, adminId: h.adminId, adminName: h.admin?.name })));

  const doctors = await prisma.doctor.findMany({ include: { hospital: true } });
  console.log("\n=== Doctors ===");
  console.log(doctors.map(d => ({ id: d.id, name: d.name, hospitalId: d.hospitalId, hospitalName: d.hospital?.name })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
