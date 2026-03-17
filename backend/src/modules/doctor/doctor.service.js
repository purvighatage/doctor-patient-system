const prisma = require("../../config/prisma");

// ===== Admin: Create Doctor =====
const createDoctor = async ({ userId, specialty, qualifications, experience, fees, clinicName, gender }) => {
  return prisma.doctor.create({
    data: { userId, specialty, qualifications, experience, fees, clinicName, gender },
  });
};

// ===== Admin: List Doctors =====
const listDoctors = async () => {
  return prisma.doctor.findMany({ where: { active: true }, include: { user: true, slots: true } });
};

// ===== Admin: Activate/Deactivate Doctor =====
const setDoctorStatus = async (doctorId, active) => {
  return prisma.doctor.update({ where: { id: doctorId }, data: { active } });
};

// ===== Doctor: Add Slot =====
const addSlot = async ({ doctorId, date, startTime, endTime }) => {
  return prisma.slot.create({ data: { doctorId, date: new Date(date), startTime: new Date(startTime), endTime: new Date(endTime) } });
};

// ===== Doctor: List Slots =====
const listSlots = async (doctorId) => {
  return prisma.slot.findMany({ where: { doctorId } });
};

// ===== Doctor: Update Slot =====
const updateSlot = async (slotId, data) => {
  const slot = await prisma.slot.findUnique({ where: { id: slotId }, include: { appointment: true } });
  if (slot.appointment) throw new Error("Cannot update booked slot");
  return prisma.slot.update({ where: { id: slotId }, data });
};

module.exports = {
  createDoctor,
  listDoctors,
  setDoctorStatus,
  addSlot,
  listSlots,
  updateSlot,
};