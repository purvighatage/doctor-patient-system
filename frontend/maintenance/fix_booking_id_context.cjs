const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `      if (res.ok) {
           setAppointments(prev => ({
             ...prev,
             scheduled: [...prev.scheduled, newApp]
           }));
           setIsModalOpen(false);`;

const replace = `      if (res.ok) {
           const data = await res.json();
           const bookedApp = { ...newApp, id: data.id };
           
           setAppointments(prev => ({
             ...prev,
             scheduled: [...prev.scheduled, bookedApp]
           }));
           setIsModalOpen(false);`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully synced booking ID in AppointmentsPage.jsx');
} else {
    console.log('Target app-append block not found to replace');
}
