const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { addDoctor, getDoctors, updateDoctorStatus, createSlot, getSlots, modifySlot } = require("./doctor.controller");

const router = express.Router();

// Admin routes
router.post("/admin/doctors", authenticate, authorize("ADMIN"), addDoctor);
router.get("/admin/doctors", authenticate, authorize("ADMIN"), getDoctors);
router.patch("/admin/doctors/:id/status", authenticate, authorize("ADMIN"), updateDoctorStatus);

// Doctor routes
router.post("/doctor/slots", authenticate, authorize("DOCTOR"), createSlot);
router.get("/doctor/slots", authenticate, authorize("DOCTOR"), getSlots);
router.patch("/doctor/slots/:id", authenticate, authorize("DOCTOR"), modifySlot);

module.exports = router;