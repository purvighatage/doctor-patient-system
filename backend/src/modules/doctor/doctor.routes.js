const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");
const { updatePassword, createSlot, getSlots, deleteSlot, getAppointments, updateAppointmentStatus, getProfile, updateProfile, getAnalytics, uploadPhoto } = require("./doctor.controller");

const router = express.Router();

router.use(authenticate);
router.use(authorize("DOCTOR"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/upload", upload.single("photo"), uploadPhoto);
router.put("/password", updatePassword);
router.post("/slots", createSlot);
router.get("/slots", getSlots);
router.delete("/slots/:id", deleteSlot);
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);
router.get("/analytics", getAnalytics);

module.exports = router;