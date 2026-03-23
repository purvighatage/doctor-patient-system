const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const email = 'verifyadmin@example.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin already exists
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Verify Admin',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log("Created test admin:", email);
  } else {
    // Reset password just in case
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log("Reset password for test admin:", email);
  }

  // Check hospital
  let hospital = await prisma.hospital.findUnique({ where: { adminId: user.id } });
  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: {
        name: 'Verification Center Hospital',
        address: '123 test address',
        phone: '1234567890',
        adminId: user.id
      }
    });
    console.log("Created test hospital for admin");
  } else {
    console.log("Existing hospital found for admin:", hospital.name);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
