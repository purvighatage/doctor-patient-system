const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const {
  getProfile,
  getDoctors,
  getDoctorById,
  bookAppointment,
  cancelAppointment,
  getHistory
} = require("./patient.controller");

const router = express.Router();

// Public routes
router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);

// Apply auth middleware to all patient routes
router.use(authenticate);
router.use(authorize("PATIENT"));

router.get("/profile", getProfile);
router.post("/appointments", bookAppointment);
router.put("/appointments/:id/cancel", cancelAppointment);
router.get("/appointments", getHistory);

module.exports = router;