const prisma = require("../../config/prisma");
const { sendBookingConfirmation } = require("../../utils/email.service");

// GET /api/patients/profile
const getProfile = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/patients/doctors
const getDoctors = async (req, res) => {
  try {
    const { search, specialty, date, startTime, minFee, maxFee, gender } = req.query;

    const filters = { active: true };

    if (search) {
      filters.name = { contains: search };
    }
    if (specialty) {
      filters.specialty = { contains: specialty };
    }
    if (gender) {
      filters.gender = gender;
    }
    if (minFee || maxFee) {
      filters.fees = {};
      if (minFee) filters.fees.gte = parseFloat(minFee);
      if (maxFee) filters.fees.lte = parseFloat(maxFee);
    }
    
    // Slot filtering
    if (date || startTime) {
      filters.slots = { some: { booked: false } };
      if (date) filters.slots.some.date = new Date(date);
      if (startTime) filters.slots.some.startTime = new Date(startTime);
    }

    const doctors = await prisma.doctor.findMany({
      where: filters,
      include: {
        slots: {
          where: {
            booked: false,
            ...(date && { date: new Date(date) }),
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/patients/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      include: {
        slots: {
          where: { booked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/patients/appointments
const bookAppointment = async (req, res) => {
  try {
    const { slotId } = req.body;
    
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id }});
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Transaction for concurrency control
    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({ where: { id: slotId } });
      
      if (!slot) throw new Error("Slot not found");
      if (slot.booked) throw new Error("Slot is already booked");

      const updatedSlot = await tx.slot.update({
        where: { id: slotId },
        data: { booked: true }
      });

      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: slot.doctorId,
          slotId: slot.id,
          status: "BOOKED"
        }
      });

      return { appointment, updatedSlot };
    });

    // Fetch the doctor to get their name for the email
    const doctor = await prisma.doctor.findUnique({
      where: { id: result.appointment.doctorId },
      select: { name: true }
    });

    // Send the email in the background (DO NOT await inside response flow unless critical)
    sendBookingConfirmation(
      patient.email,
      patient.name,
      doctor.name,
      result.updatedSlot.date,
      result.updatedSlot.startTime
    ).catch(console.error);

    res.status(201).json({ message: "Appointment booked successfully", appointment: result.appointment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/patients/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: { slot: true, patient: true }
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patient.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    if (appointment.status === "CANCELLED") return res.status(400).json({ message: "Already cancelled" });

    // Check if cancellation is > 2 hours away
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (appointment.slot.startTime < twoHoursFromNow) {
      return res.status(400).json({ message: "Cancellations are only allowed if > 2 hours away" });
    }

    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status: "CANCELLED" }
      }),
      prisma.slot.update({
        where: { id: appointment.slotId },
        data: { booked: false }
      })
    ]);

    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/patients/appointments
const getHistory = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id }});
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { select: { name: true, specialty: true, clinic: true } },
        slot: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
  getDoctors,
  getDoctorById,
  bookAppointment,
  cancelAppointment,
  getHistory
};
