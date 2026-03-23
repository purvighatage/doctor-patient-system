const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");

// PUT /api/doctors/password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot be the same as the old password" });
    }

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

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: "Date, startTime, and endTime are required" });
    }

    const [startHour, startMin] = startTime.split(':');
    const start = new Date(date);
    start.setHours(parseInt(startHour, 10), parseInt(startMin, 10), 0, 0);

    const [endHour, endMin] = endTime.split(':');
    const end = new Date(date);
    end.setHours(parseInt(endHour, 10), parseInt(endMin, 10), 0, 0);

    const slotDate = new Date(date);

    if (start >= end) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: "Cannot create slots in the past" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    // Check for overlapping slots
    const overlappingSlot = await prisma.slot.findFirst({
      where: {
        doctorId: doctor.id,
        date: slotDate,
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      }
    });

    if (overlappingSlot) {
      return res.status(400).json({ message: "Slot time overlaps with an existing slot" });
    }

    const slot = await prisma.slot.create({
      data: {
        doctorId: doctor.id,
        date: slotDate,
        startTime: start,
        endTime: end,
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
    const slotId = parseInt(id);

    if (isNaN(slotId)) {
      return res.status(400).json({ message: "Invalid slot ID format" });
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    
    // Ensure the slot actually belongs to the logged-in doctor
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor || slot.doctorId !== doctor.id) {
       return res.status(403).json({ message: "Unauthorized to delete this slot" });
    }

    if (slot.booked) return res.status(400).json({ message: "Cannot delete a booked slot" });

    await prisma.slot.delete({ where: { id: slotId } });

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors/appointments
const getAppointments = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          select: { name: true, email: true, phone: true }
        },
        slot: {
          select: { date: true, startTime: true, endTime: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/doctors/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const apptId = parseInt(id);
    if (isNaN(apptId)) {
      return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    // Validate status
    const validStatuses = ["PENDING", "BOOKED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointment = await prisma.appointment.findFirst({
      where: { id: apptId, doctorId: doctor.id }
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // State transition validations
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot update a cancelled appointment" });
    }
    
    if (appointment.status === "COMPLETED" && status !== "COMPLETED") {
       return res.status(400).json({ message: "Cannot change status of an already completed appointment" });
    }

    const updatedAppt = await prisma.appointment.update({
      where: { id: apptId },
      data: { status }
    });

    // If cancelled, free up the slot
    if (status === "CANCELLED" && appointment.status !== "CANCELLED") {
      await prisma.slot.update({
        where: { id: appointment.slotId },
        data: { booked: false }
      });
    }

    res.json({ message: `Appointment status updated to ${status}`, appointment: updatedAppt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updatePassword,
  createSlot,
  getSlots,
  deleteSlot,
  getAppointments,
  updateAppointmentStatus
};