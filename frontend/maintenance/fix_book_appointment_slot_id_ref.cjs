const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'patient', 'patient.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

const search = `      const updatedSlot = await tx.slot.update({
        where: { id: slotId },
        data: { booked: true }
      });`;

const replace = `      const updatedSlot = await tx.slot.update({
        where: { id: currentSlotId },
        data: { booked: true }
      });`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated slot ID reference in bookAppointment');
} else {
    console.log('Target slot update block not found in patient.controller.js');
}
