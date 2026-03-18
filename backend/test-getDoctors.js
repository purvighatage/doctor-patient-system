const { PrismaClient } = require('@prisma/client');
const { getDoctors } = require('./src/modules/patient/patient.controller');

const prisma = new PrismaClient();

async function run() {
  const req = { query: {} };
  const res = {
    json: (data) => console.log('Patient SEARCH response:', JSON.stringify(data, null, 2)),
    status: (code) => ({ json: (data) => console.log('Status', code, data) })
  };

  await getDoctors(req, res);
}

run().catch(console.error).finally(() => prisma.$disconnect());
