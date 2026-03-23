const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `  const handleBook = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
      alert("Please fill in all selection fields");
      return;
    }
    const doc = doctors.find(d => d.id === parseInt(selectedDoctor));`;

const inject = `  const handleBook = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
      alert("Please fill in all selection fields");
      return;
    }

    // Validation for Past Time on Today
    const today = new Date();
    // Dashboard calendar says March 2026
    const isToday = selectedDate === today.getDate() && today.getMonth() === 2 && today.getFullYear() === 2026;

    if (isToday) {
         const timeMatch = selectedTime.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
         if (timeMatch) {
              let hours = parseInt(timeMatch[1]);
              const minutes = parseInt(timeMatch[2]);
              const ampm = timeMatch[3].toUpperCase();
              
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
              
              const selectedDateTime = new Date();
              selectedDateTime.setHours(hours, minutes, 0, 0);
              
              if (selectedDateTime < today) {
                   alert("The selected time slot has already passed for today. Please pick a future time.");
                   return;
              }
         }
    }

    const doc = doctors.find(d => d.id === parseInt(selectedDoctor));`;

if (content.includes(search)) {
    content = content.replace(search, inject);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated handleBook with past time validation');
} else {
    console.log('Target handleBook block not found in AppointmentsPage.jsx');
}
