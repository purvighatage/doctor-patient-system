const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `{(availableSlots.filter(s => new Date(s.startTime).getDate() === selectedDate)).map(s => (`;

const replace = `{(availableSlots.filter(s => {
                      const d = new Date(s.startTime);
                      // Match March 2026 (Month 2 is index 2 for March)
                      return d.getDate() === selectedDate && d.getMonth() === 2 && d.getFullYear() === 2026;
                    })).map(s => (`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully enforced month/year matching layout');
} else {
    console.log('Slow select time filter map not found to replace');
}
