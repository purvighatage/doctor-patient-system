const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Routes & middleware
const authRoutes = require("./modules/auth/auth.routes");
const doctorRoutes = require("./modules/doctor/doctor.routes");
const slotRoutes = require("./modules/slot/slot.routes");

const { authenticate, authorize } = require("./middleware/auth.middleware");

// Prisma client
const prisma = require("./config/prisma");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route registration
app.use("/api/slots", slotRoutes);
app.use("/api/auth", authRoutes);

// Add doctor routes under /api
app.use("/api", doctorRoutes); // ✅ This line added

// Test routes
app.get("/test-patient", authenticate, authorize("PATIENT"), (req, res) => {
  res.json({ message: `Hello Patient ${req.user?.id} - ${req.user?.role}` });
});

app.get("/test-admin", authenticate, authorize("ADMIN"), (req, res) => {
  res.json({ message: `Hello Admin ${req.user?.id} - ${req.user?.role}` });
});

// Example: Add patient (for demo)
app.post("/api/patient", authenticate, authorize("PATIENT"), async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const patient = await prisma.patient.create({
      data: { name, email },
    });
    res.json({ message: "Patient added", patientId: patient.id });
  } catch (err) {
    console.error("Prisma Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Doctor Patient API Running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});