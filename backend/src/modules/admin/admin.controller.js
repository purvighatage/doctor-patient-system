const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// POST /api/admins/doctors
const createDoctor = async (req, res) => {
  try {
    const { name, email, specialty, qualifications, experience, fees, clinic, gender, photo } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User with this email already exists" });

    // Generate a secure temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
        mustChangePassword: true,
        doctor: {
          create: {
            name,
            specialty,
            qualifications,
            experience: parseInt(experience) || 0,
            fees: parseFloat(fees) || 0,
            clinic,
            gender,
            photo
          }
        }
      },
      include: { doctor: true }
    });

    res.status(201).json({
      message: "Doctor created successfully",
      tempPassword, // In a real app, this should be sent via email
      doctor: user.doctor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admins/doctors/:id/status
const toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: "active field must be a boolean" });
    }

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { active }
    });

    res.json({ message: `Doctor status updated to ${active ? 'Active' : 'Inactive'}`, doctor });
  } catch (err) {
    res.status(500).json({ message: "Error updating doctor status" });
  }
};

// GET /api/admins/analytics
const getAnalytics = async (req, res) => {
  try {
    // Basic Counts
    const totalPatients = await prisma.patient.count();
    const activeDoctors = await prisma.doctor.count({ where: { active: true } });
    const totalAppointments = await prisma.appointment.count();
    
    const cancelledAppts = await prisma.appointment.count({ where: { status: "CANCELLED" }});
    const cancellationRate = totalAppointments === 0 ? 0 : (cancelledAppts / totalAppointments) * 100;

    // Most Booked Specialty
    const appsWithDoctor = await prisma.appointment.findMany({
      include: { doctor: true }
    });

    const specialtyCounts = {};
    const doctorCounts = {};

    appsWithDoctor.forEach(app => {
      const spec = app.doctor.specialty;
      const docName = app.doctor.name;
      
      if (!specialtyCounts[spec]) specialtyCounts[spec] = 0;
      if (!doctorCounts[docName]) doctorCounts[docName] = 0;
      
      specialtyCounts[spec]++;
      doctorCounts[docName]++;
    });

    const mostBookedSpecialty = Object.keys(specialtyCounts).sort((a,b) => specialtyCounts[b] - specialtyCounts[a])[0] || null;
    const mostBookedDoctor = Object.keys(doctorCounts).sort((a,b) => doctorCounts[b] - doctorCounts[a])[0] || null;

    // Appointments over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAppointments = await prisma.appointment.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const appointmentsByDate = {};
    recentAppointments.forEach(app => {
      const dateStr = app.createdAt.toISOString().split('T')[0];
      if (!appointmentsByDate[dateStr]) appointmentsByDate[dateStr] = 0;
      appointmentsByDate[dateStr]++;
    });

    res.json({
      metrics: {
        totalPatients,
        activeDoctors,
        totalAppointments,
        cancellationRate: cancellationRate.toFixed(2) + "%"
      },
      visuals: {
        mostBookedSpecialty,
        mostBookedDoctor,
        appointmentsOverTime: appointmentsByDate
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDoctor,
  toggleDoctorStatus,
  getAnalytics
};
