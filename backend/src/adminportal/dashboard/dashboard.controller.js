const prisma = require("../../config/prisma");

// GET /api/adminportal/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    // 1. Total Patients (Distinct in this hospital)
    // We can count distinct patient appointments
    const appointmentsWithDoctor = await prisma.appointment.findMany({
      where: { doctor: { hospitalId: hospital.id } },
      select: { patientId: true }
    });
    const totalPatients = new Set(appointmentsWithDoctor.map(a => a.patientId)).size;

    // 2. Total Doctors (Active)
    const totalDoctors = await prisma.doctor.count({
      where: { hospitalId: hospital.id, active: true }
    });

    // 3. Today's Appointments
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await prisma.appointment.count({
      where: {
        doctor: { hospitalId: hospital.id },
        slot: {
          date: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }
    });

    // 4. Monthly Revenue
    // Sum of doctor fees for COMPLETED appointments in the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedApptsThisMonth = await prisma.appointment.findMany({
      where: {
        status: "COMPLETED",
        doctor: { hospitalId: hospital.id },
        slot: {
          date: { gte: startOfMonth }
        }
      },
      include: {
        doctor: { select: { fees: true } }
      }
    });

    const monthlyRevenue = completedApptsThisMonth.reduce((sum, appt) => sum + (appt.doctor.fees || 0), 0);

    // active users, pending approvals (placeholder/fallback logic)
    // Pending Approvals might be doctors active=false or appointments pending
    const pendingApprovals = await prisma.doctor.count({
      where: { hospitalId: hospital.id, active: false }
    });

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        monthlyRevenue
      },
      overview: {
        activeUsers: totalPatients + totalDoctors, // mock calculation
        pendingApprovals,
        systemHealth: "Optimal"
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/adminportal/dashboard/growth-trends
const getGrowthTrends = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Last 6 months including current
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctor: { hospitalId: hospital.id },
        slot: { date: { gte: sixMonthsAgo } }
      },
      include: {
        doctor: { select: { fees: true } },
        slot: { select: { date: true } }
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    const patientsData = [];
    const revenueData = [];

    // Initialize map for last 6 months
    const monthlyStats = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        const key = `${year}-${monthIndex}`;
        labels.push(`${months[monthIndex]} ${year}`);
        monthlyStats[key] = { patients: new Set(), revenue: 0 };
    }

    appointments.forEach(appt => {
        const date = new Date(appt.slot.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyStats[key]) {
             monthlyStats[key].patients.add(appt.patientId);
             if (appt.status === "COMPLETED") {
                 monthlyStats[key].revenue += (appt.doctor.fees || 0);
             }
        }
    });

    Object.keys(monthlyStats).forEach(key => {
         patientsData.push(monthlyStats[key].patients.size);
         revenueData.push(monthlyStats[key].revenue);
    });

    res.json({
        labels,
        patients: patientsData,
        revenue: revenueData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/adminportal/dashboard/specialization
const getAppointmentsSpecialization = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { adminId: req.user.id } });
    if (!hospital) return res.status(400).json({ message: "Admin is not assigned to a hospital" });

    const appointments = await prisma.appointment.findMany({
        where: { doctor: { hospitalId: hospital.id } },
        include: { doctor: { select: { specialty: true } } }
    });

    const specialtyCounts = {};
    appointments.forEach(appt => {
         const spec = appt.doctor.specialty;
         specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
    });

    const labels = Object.keys(specialtyCounts);
    const values = Object.values(specialtyCounts);

    res.json({
        labels,
        values
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getGrowthTrends,
  getAppointmentsSpecialization
};
