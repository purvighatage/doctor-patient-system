const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.findFirst({
    where: { role: 'DOCTOR' }
  });

  if (user) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        mustChangePassword: true 
      }
    });
    console.log(`DOCTOR_EMAIL=${user.email}`);
    console.log(`PASSWORD=password123`);
  } else {
    console.log('No doctor found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
