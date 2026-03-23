const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `      if (res.ok) {
           const data = await res.json();
           const bookedApp = { ...newApp, id: data.id };
           
           setAppointments(prev => ({
             ...prev,
             scheduled: [...prev.scheduled, bookedApp]
           }));
           setIsModalOpen(false);
           // Reset fields
           setSelectedDoctor('');
           setSelectedSlotId('');
           setSelectedTime('');
           setConsultationType('');
           setReason('');
      } else {
           alert("Failed to book appointment on backend");
      }`;

const replace = `      if (res.ok) {
           const data = await res.json();
           const bookedApp = { ...newApp, id: data.appointment ? data.appointment.id : Date.now() };
           
           setAppointments(prev => ({
             ...prev,
             scheduled: [...prev.scheduled, bookedApp]
           }));
           setIsModalOpen(false);
           // Reset fields
           setSelectedDoctor('');
           setSelectedSlotId('');
           setSelectedTime('');
           setConsultationType('');
           setReason('');
      } else {
           const errData = await res.json().catch(() => ({}));
           alert("Failed to book on backend: " + (errData.message || "Unknown Error"));
      }`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated alerts in AppointmentsPage.jsx');
} else {
    console.log('Target validation block not found for replacement');
}
