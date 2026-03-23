const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `    if (isToday) {
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
    }`;

const replace = `    if (isToday) {
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

    // Double Booking Conflict Validation
    const targetDateStr = \`March \${selectedDate}, 2026\`;
    const isConflict = appointments.scheduled && appointments.scheduled.some(app => {
         const appDateClean = app.date.includes(',') && !app.date.startsWith('March')
           ? app.date.split(',').slice(1).join(',').trim()
           : app.date;
         return appDateClean === targetDateStr && app.time === selectedTime;
    });

    if (isConflict) {
         alert("You already have an appointment booked for this date and time. Please pick another slot.");
         return;
    }`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully added double booking validation');
} else {
    console.log('Target past-time validation block not found for replacement');
}
