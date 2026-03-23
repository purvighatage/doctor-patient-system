const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'PatientPortalLayout.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `  const [appointments, setAppointments] = useState({
    scheduled: [
      {
        id: 1,
        doctor: 'Dr. Emily Smith',
        specialty: 'Routine checkup',
        date: 'Sunday, March 22, 2026',
        time: '10:00 AM',
        type: 'In-Person Consultation',
        status: 'scheduled',
      },
      {
        id: 2,
        doctor: 'Dr. Priya Patel',
        specialty: 'Follow up consultation',
        date: 'Wednesday, March 25, 2026',
        time: '02:30 PM',
        type: 'Video Consultation',
        status: 'scheduled',
        hasCall: true,
      }
    ],
    pending: [],
    completed: []
  });`;

const replace = `  const [appointments, setAppointments] = useState({ scheduled: [], pending: [], completed: [] });

  const fetchAppointments = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const res = await fetch('/api/patients/appointments', {
         headers: { 'Authorization': \`Bearer \${user.token}\` } // assuming token in user object or cookie
      });
      if (res.ok) {
         const data = await res.json();
         // Backend returns appointment arrays
         const scheduled = data.filter(a => a.status === 'BOOKED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'scheduled',
             slotId: a.slotId
         }));
         setAppointments({ scheduled, pending: [], completed: [] });
      }
    } catch (err) {
       console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated PatientPortalLayout.jsx to fetch appointments');
} else {
    console.log('Static appointments block not found in PatientPortalLayout.jsx');
}
