const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Revert validations line 43
const searchValid = `  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlotId || !consultationType) {`;

const replaceValid = `  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {`;

// 2. Wrap body JSON.stringify replacing
const searchBody = `      const res = await fetch(\`\${API_BASE}/patients/appointments\`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': \`Bearer \${token}\`
         },
         body: JSON.stringify({ slotId: parseInt(selectedSlotId) })
      });`;

// Replace body with on-the-fly variables bindings
const replaceBody = `      const timeMatch = selectedTime.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
      let hours = 10; let minutes = 0;
      if (timeMatch) {
           hours = parseInt(timeMatch[1]);
           minutes = parseInt(timeMatch[2]);
           if (timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
           if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      const slotDate = new Date(2026, 2, selectedDate, 12, 0, 0); 
      const startTimeObj = new Date(2026, 2, selectedDate, hours, minutes, 0);

      const res = await fetch(\`\${API_BASE}/patients/appointments\`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': \`Bearer \${token}\`
         },
         body: JSON.stringify({ 
              doctorId: parseInt(selectedDoctor),
              date: slotDate.toISOString(),
              startTime: startTimeObj.toISOString()
         })
      });`;

if (content.includes(searchValid)) {
    content = content.replace(searchValid, replaceValid);
} else { console.log("searchValid failed"); }

if (content.includes(searchBody)) {
    content = content.replace(searchBody, replaceBody);
} else { console.log("searchBody failed"); }


// 3. Revert select dropdown DOM back from dynamic to static
// Script connects_page line 140 earlier: replaceSelectTime
const searchSelect = `<select value={selectedSlotId} onChange={(e) => {
                    setSelectedSlotId(e.target.value);
                    const s = availableSlots.find(sl => sl.id === parseInt(e.target.value));
                    if (s) setSelectedTime(new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                  }}>
                    <option value="" disabled>Select time</option>
                    {(availableSlots.filter(s => {
                      const d = new Date(s.startTime);
                      // Match March 2026 (Month 2 is index 2 for March)
                      return d.getDate() === selectedDate && d.getMonth() === 2 && d.getFullYear() === 2026;
                    })).map(s => (
                      <option key={s.id} value={s.id}>{new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</option>
                    ))}
                  </select>`;

const replaceSelect = `<select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                    <option value="" disabled>Select time</option>
                    <option value="10:00AM">10:00 AM</option>
                    <option value="11:30AM">11:30 AM</option>
                    <option value="02:30PM">02:30 PM</option>
                  </select>`;

if (content.includes(searchSelect)) {
    content = content.replace(searchSelect, replaceSelect);
} else { console.log("searchSelect failed"); }

fs.writeFileSync(filePath, content);
console.log('Successfully reverted AppointmentsPage.jsx triggers');
