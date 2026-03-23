const fs = require('fs');
const path = require('path');

// 1. Update PatientPortalLayout.jsx
const layoutPath = path.join(__dirname, 'frontend', 'src', 'patient-portal', 'PatientPortalLayout.jsx');
if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf8');

    // Mapped scheduled block
    const searchScheduled = `         const scheduled = data.filter(a => a.status === 'BOOKED' || a.status === 'PENDING').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'scheduled',
             slotId: a.slotId
         }));`;

    const replaceScheduled = `         const scheduled = data.filter(a => a.status === 'BOOKED' || a.status === 'PENDING').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'scheduled',
             slotId: a.slotId,
             startTime: a.slot ? a.slot.startTime : null,
             doctorId: a.doctor ? a.doctor.id : null
         }));`;

    // Mapped completed block
    const searchCompleted = `         const completed = data.filter(a => a.status === 'COMPLETED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'completed',
             slotId: a.slotId
          }));`;

    const replaceCompleted = `         const completed = data.filter(a => a.status === 'COMPLETED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'completed',
             slotId: a.slotId,
             startTime: a.slot ? a.slot.startTime : null,
             doctorId: a.doctor ? a.doctor.id : null
          }));`;

    if (content.includes(searchScheduled)) {
        content = content.replace(searchScheduled, replaceScheduled);
        content = content.replace(searchCompleted, replaceCompleted);
        fs.writeFileSync(layoutPath, content);
        console.log('Successfully added startTime and doctorId to PatientPortalLayout mapped arrays');
    } else {
        console.log('Target Scheduled map snippet not found in PatientPortalLayout.jsx');
    }
}

// 2. Update AppointmentsPage.jsx
const appointmentsPath = path.join(__dirname, 'frontend', 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
if (fs.existsSync(appointmentsPath)) {
    let content = fs.readFileSync(appointmentsPath, 'utf8');

    // handleCancel Rule
    const searchCancel = `  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem('token');`;

    const replaceCancel = `  const handleCancel = async (id) => {
    try {
      const appointment = activeAppointments.find(app => app.id === id);
      if (appointment && appointment.startTime) {
         const appTime = new Date(appointment.startTime);
         const now = new Date();
         const diffMs = appTime - now;
         const diffHours = diffMs / (1000 * 60 * 60);
         if (diffHours < 2 && diffHours > 0) { // check if it's in future and < 2 hours
            alert("You cannot cancel an appointment less than 2 hours before the start time.");
            return;
         }
      }

      const token = localStorage.getItem('token');`;

    // handleReschedule helper
    const searchRescheduleTrigger = `  const activeAppointments = appointments[activeTab] || [];`;
    const replaceRescheduleTrigger = `  const handleReschedule = (appointment) => {
       if (appointment.doctorId) {
            setSelectedDoctor(appointment.doctorId.toString());
       }
       setIsModalOpen(true);
  };

  const activeAppointments = appointments[activeTab] || [];`;

    // Button updates
    const searchButton = `<button className="action-btn secondary">Reschedule</button>`;
    const replaceButton = `<button className="action-btn secondary" onClick={() => handleReschedule(appointment)}>Reschedule</button>`;

    if (content.includes(searchCancel) && content.includes(searchButton)) {
        content = content.replace(searchCancel, replaceCancel);
        content = content.replace(searchRescheduleTrigger, replaceRescheduleTrigger);
        content = content.replace(searchButton, replaceButton);
        fs.writeFileSync(appointmentsPath, content);
        console.log('Successfully updated AppointmentsPage with cancel & reschedule logic');
    } else {
        console.log('Target cancel function or button trigger match not found in AppointmentsPage.jsx');
    }
}
