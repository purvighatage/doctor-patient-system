const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const injectLogic = `  const { appointments, setAppointments } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const API_BASE = '/api';

  const handleBook = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
      alert("Please fill in all selection fields");
      return;
    }
    const doc = doctors.find(d => d.id === parseInt(selectedDoctor));
    const newApp = {
      id: Date.now(),
      doctor: doc ? (doc.name.startsWith('Dr.') ? doc.name : \`Dr. \${doc.name}\`) : 'Doctor',
      specialty: doc ? doc.specialty : 'Consultation',
      date: \`March \${selectedDate}, 2026\`,
      time: selectedTime,
      type: consultationType,
      status: 'scheduled'
    };
    setAppointments(prev => ({
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

// Replace search using state hooks
const searchState = `  const { appointments, setAppointments } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const API_BASE = '/api';`;

if (content.includes(searchState)) {
    content = content.replace(searchState, injectLogic);
    
    // Also replace the button onClick
    const searchBtn = `<button className="submit-book-btn" onClick={() => setIsModalOpen(false)}>`;
    const replaceBtn = `<button className="submit-book-btn" onClick={handleBook}>`;
    
    if (content.includes(searchBtn)) {
        content = content.replace(searchBtn, replaceBtn);
        fs.writeFileSync(filePath, content);
        console.log('Successfully updated AppointmentsPage.jsx with handleBook');
    } else {
        console.log('Button target not found');
    }
} else {
    console.log('Search state target not found');
}
