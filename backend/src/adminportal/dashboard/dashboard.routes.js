const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const {
  getDashboardStats,
  getGrowthTrends,
  getAppointmentsSpecialization
} = require("./dashboard.controller");

const router = express.Router();

// All routes are protected and only accessible by ADMIN
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/stats", getDashboardStats);
router.get("/growth-trends", getGrowthTrends);
router.get("/specialization", getAppointmentsSpecialization);

module.exports = router;
