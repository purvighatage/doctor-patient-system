const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `  const [doctors, setDoctors] = useState([]);
  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        let res = await fetch(\`\${API_BASE}/patients/doctors\`);
        if (!res.ok) {
          // Fallback to 5000 for local dev robust triggers setup
          res = await fetch(\`http://localhost:5000/api/patients/doctors\`);
        }
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }`;

const replace = `  const [doctors, setDoctors] = useState([]);
  const API_BASE = '/api';

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(\`\${API_BASE}/patients/doctors\`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated AppointmentsPage.jsx');
} else {
    console.log('Target content not found in AppointmentsPage.jsx');
}
