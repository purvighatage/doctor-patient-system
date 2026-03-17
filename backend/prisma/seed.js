const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });