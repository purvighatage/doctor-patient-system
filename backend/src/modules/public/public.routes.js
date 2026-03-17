const express = require("express");
const { getDoctors } = require("../patient/patient.controller");

const router = express.Router();

// Allow anyone (unauthenticated) to view doctors and slots
router.get("/doctors", getDoctors);

module.exports = router;
