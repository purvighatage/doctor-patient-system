const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'patient', 'patient.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

const searchBody = `const bookAppointment = async (req, res) => {
  try {
    const { slotId, clientTime } = req.body;
    
    if (!slotId || typeof slotId !== 'number') {
      return res.status(400).json({ message: "A valid slotId is required" });
    }`;

const replaceBody = `const bookAppointment = async (req, res) => {
  try {
    let { slotId, doctorId, startTime, date, clientTime } = req.body;
    
    if (!slotId && (!doctorId || !startTime || !date)) {
      return res.status(400).json({ message: "slotId OR (doctorId, startTime, date) are required" });
    }`;

const searchTx = `    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({ where: { id: slotId } });`;

const replaceTx = `    const result = await prisma.$transaction(async (tx) => {
      let currentSlotId = slotId;

      if (!currentSlotId && doctorId && startTime && date) {
           const newSlot = await tx.slot.create({
                data: {
                     doctorId: parseInt(doctorId),
                     date: new Date(date),
                     startTime: new Date(startTime),
                     endTime: new Date(new Date(startTime).getTime() + 30 * 60000),
                     booked: true
                }
           });
           currentSlotId = newSlot.id;
      }

      const slot = await tx.slot.findUnique({ where: { id: currentSlotId } });`;

// Replace bottom part of appointment creation mapping if needed?
const searchCreate = `          data: {
            patientId: patient.id,
            doctorId: slot.doctorId,
            slotId: slot.id,`;

const replaceCreate = `          data: {
            patientId: patient.id,
            doctorId: slot.doctorId,
            slotId: slot.id,`; // un-changed since it works with `slot` which we look up below.


if (content.includes(searchBody) && content.includes(searchTx)) {
    content = content.replace(searchBody, replaceBody);
    content = content.replace(searchTx, replaceTx);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated bookAppointment backend');
} else {
    console.log('Target blocks for bookAppointment replacement not found');
}
