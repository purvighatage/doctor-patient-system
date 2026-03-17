const express = require("express");
const { addSlot, getSlots } = require("./slot.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

const router = express.Router();

// Doctor-only: create slot
router.post("/", authenticate, authorize("DOCTOR"), addSlot);

// Get slots for a doctor (public or protected)
router.get("/:doctorId", authenticate, getSlots);

module.exports = router;