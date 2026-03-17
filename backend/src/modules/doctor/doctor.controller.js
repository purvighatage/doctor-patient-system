const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");

// PUT /api/doctors/password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid old password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/doctors/slots
const createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    // Ensure slot doesn't already exist for this doctor/date/time
    const existingSlot = await prisma.slot.findFirst({
      where: {
        doctorId: doctor.id,
        date: new Date(date),
        startTime: new Date(startTime)
      }
    });

    if (existingSlot) {
      return res.status(400).json({ message: "Slot already exists at this time" });
    }

    const slot = await prisma.slot.create({
      data: {
        doctorId: doctor.id,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        booked: false
      }
    });

    res.status(201).json({ message: "Slot created successfully", slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors/slots
const getSlots = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const slots = await prisma.slot.findMany({
      where: { doctorId: doctor.id },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/doctors/slots/:id
const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await prisma.slot.findUnique({ where: { id: parseInt(id) } });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.booked) return res.status(400).json({ message: "Cannot delete a booked slot" });

    await prisma.slot.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updatePassword,
  createSlot,
  getSlots,
  deleteSlot
};