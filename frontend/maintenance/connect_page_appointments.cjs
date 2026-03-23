const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject availableSlots State and useEfffect for Slot Fetch
const searchState = `  const { appointments, setAppointments } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const API_BASE = '/api';`;

const injectState = `  const { appointments, setAppointments } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const API_BASE = '/api';

  useEffect(() => {
    if (!selectedDoctor) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const res = await fetch(\`\${API_BASE}/patients/doctors/\${selectedDoctor}\`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      }
    };
    fetchSlots();
  }, [selectedDoctor]);`;

// 2. Update handleBook to call POST API
const searchBook = `  const handleBook = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
      alert("Please fill in all selection fields");
      return;
    }`;

const replaceBook = `  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlotId || !consultationType) {
      alert("Please fill in all selection fields");
      return;
    }`;

const searchBookEnd = `    setAppointments(prev => ({
      ...prev,
      scheduled: [...prev.scheduled, newApp]
    }));
    setIsModalOpen(false);
    // Reset fields
    setSelectedDoctor('');
    setSelectedTime('');
    setConsultationType('');
    setReason('');
  };`;

const replaceBookEnd = `    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await fetch(\`\${API_BASE}/patients/appointments\`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': \`Bearer \${user.token}\`
         },
         body: JSON.stringify({ slotId: parseInt(selectedSlotId) })
      });

      if (res.ok) {
           setAppointments(prev => ({
             ...prev,
             scheduled: [...prev.scheduled, newApp]
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
      }
    } catch (err) {
       console.error("Booking error:", err);
    }
  };`;

// 3. Update handleCancel to call PUT API
const searchCancel = `  const handleCancel = (id) => {
    setAppointments(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(app => app.id !== id)
    }));
  };`;

const replaceCancel = `  const handleCancel = async (id) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await fetch(\`\${API_BASE}/patients/appointments/\${id}/cancel\`, {
           method: 'PUT',
           headers: { 'Authorization': \`Bearer \${user.token}\` }
      });

      if (res.ok) {
           setAppointments(prev => ({
             ...prev,
             [activeTab]: prev[activeTab].filter(app => app.id !== id)
           }));
      } else {
           alert("Failed to cancel appointment on backend");
      }
    } catch (err) {
       console.error("Cancel error:", err);
    }
  };`;


// 4. Replace Select Time with dynamic map
const searchSelectTime = `<select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                    <option value="" disabled>Select time</option>
                    <option value="10:00AM">10:00 AM</option>
                    <option value="11:30AM">11:30 AM</option>
                    <option value="02:30PM">02:30 PM</option>
                  </select>`;

const replaceSelectTime = `<select value={selectedSlotId} onChange={(e) => {
                    setSelectedSlotId(e.target.value);
                    const s = availableSlots.find(sl => sl.id === parseInt(e.target.value));
                    if (s) setSelectedTime(new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                  }}>
                    <option value="" disabled>Select time</option>
                    {(availableSlots.filter(s => new Date(s.startTime).getDate() === selectedDate)).map(s => (
                      <option key={s.id} value={s.id}>{new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</option>
                    ))}
                  </select>`;

if (content.includes(searchState)) {
    content = content.replace(searchState, injectState);
} else { console.log('1 failed'); }

if (content.includes(searchBook)) {
    content = content.replace(searchBook, replaceBook);
} else { console.log('2 failed'); }

if (content.includes(searchBookEnd)) {
    content = content.replace(searchBookEnd, replaceBookEnd);
} else { console.log('3 failed'); }

if (content.includes(searchCancel)) {
    content = content.replace(searchCancel, replaceCancel);
} else { console.log('4 failed'); }

if (content.includes(searchSelectTime)) {
    content = content.replace(searchSelectTime, replaceSelectTime);
} else { console.log('5 failed'); }

fs.writeFileSync(filePath, content);
console.log('Successfully updated AppointmentsPage.jsx with Backend Connections');
