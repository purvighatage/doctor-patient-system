const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'patient-portal', 'PatientPortalLayout.jsx');
if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf8');

    const searchState = `         const scheduled = data.filter(a => a.status === 'BOOKED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'scheduled',
             slotId: a.slotId
         }));
         setAppointments({ scheduled, pending: [], completed: [] });`;

    const replaceState = `         const scheduled = data.filter(a => a.status === 'BOOKED' || a.status === 'PENDING').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'scheduled',
             slotId: a.slotId
         }));

         const completed = data.filter(a => a.status === 'COMPLETED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'completed',
             slotId: a.slotId
          }));

         setAppointments({ scheduled, pending: [], completed });`;

    if (content.includes(searchState)) {
        content = content.replace(searchState, replaceState);
        fs.writeFileSync(layoutPath, content);
        console.log('Successfully connected Patient Completed appointments to layout');
    } else {
        console.log('Target scheduled search state string not found in PatientPortalLayout.jsx');
    }
}
