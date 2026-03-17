const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@system.com' }
    });
    if (existingAdmin) {
      console.log('Admin already exists!');
      return;
    }

    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@system.com',
        password: hash,
        role: 'ADMIN'
      }
    });
    console.log('Admin user seeded successfully. Use email: admin@system.com, password: admin123');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
