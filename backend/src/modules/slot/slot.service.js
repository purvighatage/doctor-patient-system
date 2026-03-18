const prisma = require("../../config/prisma");

// Doctor creates a slot
async function createSlot({ doctorId, date, startTime, endTime }) {
  return await prisma.slot.create({
    data: {
      doctorId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      booked: false,
    },
  });
}

// List slots for a doctor (only available slots, not in the past)
async function listSlots(doctorId) {
  return await prisma.slot.findMany({
    where: { 
      doctorId, 
      booked: false,
      startTime: { gte: new Date() }
    },
    orderBy: { startTime: "asc" },
  });
}

// Mark slot booked
async function markSlotBooked(slotId) {
  return await prisma.slot.update({
    where: { id: slotId },
    data: { booked: true },
  });
}

module.exports = { createSlot, listSlots, markSlotBooked };