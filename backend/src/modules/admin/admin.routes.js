const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { createDoctor, toggleDoctorStatus, getAnalytics } = require("./admin.controller");

const router = express.Router();

// All admin routes are protected
router.use(authenticate);
router.use(authorize("ADMIN"));

router.post("/doctors", createDoctor);
router.patch("/doctors/:id/status", toggleDoctorStatus);
router.get("/analytics", getAnalytics);

module.exports = router;
