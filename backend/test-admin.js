const { PrismaClient } = require('@prisma/client');
const { getAllDoctors } = require('./src/modules/admin/admin.controller');

const prisma = new PrismaClient();

async function run() {
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@system.com' } });
  if (!adminUser) return console.log("Admin not found");

  const req = { user: { id: adminUser.id } }; // Mocking JWT auth
  const res = {
    json: (data) => console.log('Admin Doctors response:', JSON.stringify(data, null, 2)),
    status: (code) => ({ json: (data) => console.log('Error', code, data) })
  };

  await getAllDoctors(req, res);
}

run().catch(console.error).finally(() => prisma.$disconnect());
