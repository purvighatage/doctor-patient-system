const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// require("dotenv").config();

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const patientRoutes = require("./modules/patient/patient.routes");
const doctorRoutes = require("./modules/doctor/doctor.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const publicRoutes = require("./modules/public/public.routes");
const dashboardRoutes = require("./adminportal/dashboard/dashboard.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/adminportal/dashboard", dashboardRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Doctor Patient Management API is Running 🚀");
});

app.get("/test", (req, res) => {
  console.log("Test API called");
  res.send("API is working 🚀");
});
// Start server
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Force the event loop to stay alive
setInterval(() => {}, 1000 * 60 * 60);