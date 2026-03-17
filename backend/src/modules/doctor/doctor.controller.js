const { createDoctor, listDoctors, setDoctorStatus, addSlot, listSlots, updateSlot } = require("./doctor.service");

// ===== Admin: Create Doctor =====
const addDoctor = async (req, res) => {
  try {
    const result = await createDoctor(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===== Admin: List Doctors =====
const getDoctors = async (req, res) => {
  try {
    const doctors = await listDoctors();
    res.json(doctors);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===== Admin: Activate/Deactivate =====
const updateDoctorStatus = async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const { active } = req.body;
    const result = await setDoctorStatus(doctorId, active);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===== Doctor: Add Slot =====
const createSlot = async (req, res) => {
  try {
    const doctorId = req.user.id; // use logged-in doctor id
    const result = await addSlot({ ...req.body, doctorId });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===== Doctor: List Slots =====
const getSlots = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const slots = await listSlots(doctorId);
    res.json(slots);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===== Doctor: Update Slot =====
const modifySlot = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const result = await updateSlot(slotId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { addDoctor, getDoctors, updateDoctorStatus, createSlot, getSlots, modifySlot };