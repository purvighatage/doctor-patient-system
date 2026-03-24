const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validateEmail, validateName } = require("../../utils/validators");

// POST /api/admins/doctors
const createDoctor = async (req, res) => {
  try {
    const { name, email, specialty, qualifications, experience, fees, clinic, gender, photo } = req.body;
    
    // Validate required fields
    if (!validateName(name) || !email || !specialty) {
      return res.status(400).json({ message: "Valid name, email, and specialty are required fields" });
    }

    // Validate numeric fields are non-negative
    const exp = parseInt(experience) || 0;
    const fee = parseFloat(fees) || 0;
    
    if (exp < 0 || fee < 0) {
      return res.status(400).json({ message: "Experience and fees cannot be negative" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User with this email already exists" });

    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

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
            photo,
            hospitalId: hospital.id
          }
        }
      },
      include: { doctor: true }
    });

    res.status(201).json({
      message: "Doctor created successfully",
      tempPassword,
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

    const doctorId = parseInt(id);
    if (isNaN(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID format" });
    }

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: "active field must be a boolean" });
    }

    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    // Check if the doctor exists and belongs to this hospital
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!existingDoctor || existingDoctor.hospitalId !== hospital.id) {
      return res.status(403).json({ message: "Forbidden: cannot manage doctors outside your hospital" });
    }

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
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
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    const activeDoctors = await prisma.doctor.count({ where: { active: true, hospitalId: hospital.id } });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalAppointments = await prisma.appointment.count({ 
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        doctor: { hospitalId: hospital.id } 
      } 
    });
    
    const cancelledAppts = await prisma.appointment.count({ 
      where: { 
        status: "CANCELLED", 
        createdAt: { gte: thirtyDaysAgo },
        doctor: { hospitalId: hospital.id } 
      }
    });
    
    const cancellationRate = totalAppointments === 0 ? 0 : (cancelledAppts / totalAppointments) * 100;

    const appsWithDoctor = await prisma.appointment.findMany({
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        doctor: { hospitalId: hospital.id } 
      },
      include: { doctor: true }
    });

    const patientIds = new Set(appsWithDoctor.map(a => a.patientId));
    const totalPatients = patientIds.size;

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

    const mostBookedSpecialty = Object.entries(specialtyCounts).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
    const mostBookedDoctor = Object.entries(doctorCounts).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);

    // Appointments over time (last 7 days - reuse existing)
    const recentAppointments = appsWithDoctor;

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

// GET /api/admins/doctors
const getAllDoctors = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    const doctors = await prisma.doctor.findMany({
      where: { hospitalId: hospital.id },
      include: {
        user: { select: { email: true, createdAt: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admins/patients
const getAllPatients = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    const appointments = await prisma.appointment.findMany({
      where: { doctor: { hospitalId: hospital.id } },
      select: { patientId: true }
    });
    const patientIds = [...new Set(appointments.map(a => a.patientId))];

    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: {
        user: { select: { email: true, createdAt: true } },
        appointments: {
          where: { doctor: { hospitalId: hospital.id } },
          include: { doctor: { select: { name: true } } }
        }
      },
      orderBy: { id: 'desc' }
    });

    const mappedPatients = patients.map(p => ({
      ...p,
      treatingDoctors: [...new Set(p.appointments.map(a => a.doctor.name))]
    }));

    res.json(mappedPatients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admins/appointments
const getAllAppointments = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    const appointments = await prisma.appointment.findMany({
      where: { doctor: { hospitalId: hospital.id } },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, specialty: true } },
        slot: { select: { date: true, startTime: true, endTime: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDoctor,
  toggleDoctorStatus,
  getAnalytics,
  getAllDoctors,
  getAllPatients,
  getAllAppointments
};
