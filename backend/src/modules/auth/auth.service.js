const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const registerPatient = async (data) => {
  const { name, email, phone, dob, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("patient exist , please login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "PATIENT",
      patient: {
        create: {
          name,
          email,
          phone,
          dob: new Date(dob),
        },
      },
    },
    include: {
      patient: true,
    },
  });

  return user;
};


const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctor: true, patient: true }
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      mustChangePassword: user.mustChangePassword 
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};

const registerAdminWithHospital = async (data) => {
  const { adminName, email, password, hospitalName, address, phone } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User exist, please login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: adminName,
      email,
      password: hashedPassword,
      role: "ADMIN",
      hospital: {
        create: {
          name: hospitalName,
          address,
          phone,
        },
      },
    },
    include: {
      hospital: true,
    },
  });

  return user;
};

module.exports = { registerPatient, loginUser, registerAdminWithHospital };