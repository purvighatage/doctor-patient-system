const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { updatePassword, createSlot, getSlots, deleteSlot } = require("./doctor.controller");

const router = express.Router();

router.use(authenticate);
router.use(authorize("DOCTOR"));

router.put("/password", updatePassword);
router.post("/slots", createSlot);
router.get("/slots", getSlots);
router.delete("/slots/:id", deleteSlot);

module.exports = router;