const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const docs = await prisma.doctor.findMany({
      where: {
        specialty: { contains: 'Cardiologist', mode: 'insensitive' }
      }
    });
    console.log('Success with insensitive!', docs.length);
  } catch (err) {
    console.error('Error with insensitive:', err.message);
    try {
      const docs2 = await prisma.doctor.findMany({
        where: {
          specialty: { contains: 'Cardiologist' }
        }
      });
      console.log('Success without insensitive!', docs2.length);
    } catch (err2) {
      console.error('Error without insensitive too:', err2.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
