const { createSlot, listSlots } = require("./slot.service");

// Doctor creates a slot
const addSlot = async (req, res) => {
  try {
    const doctorId = req.user.id; // from JWT
    const { date, startTime, endTime } = req.body;

    const slot = await createSlot({ doctorId, date, startTime, endTime });
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// List available slots for doctor
const getSlots = async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const slots = await listSlots(doctorId);
    res.json(slots);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { addSlot, getSlots };