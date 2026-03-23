const fs = require('fs');
const path = require('path');

// 1. Update FindDoctorsPage.jsx
const findPath = path.join(__dirname, 'frontend', 'src', 'pages', 'FindDoctorsPage', 'FindDoctorsPage.jsx');
if (fs.existsSync(findPath)) {
    let content = fs.readFileSync(findPath, 'utf8');

    // Fix API_BASE
    const searchApi = `  const API_BASE = 'http://localhost:5000/api';`;
    const replaceApi = `  const API_BASE = '/api';`;

    // Fix fetch fallback removal
    const searchFetch = `  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specialtyFilter) params.append('specialty', specialtyFilter);

      const res = await fetch(\`\${API_BASE}/patients/doctors?\${params.toString()}\`);
      if (!res.ok) {
        // If 3000 doesn't work try 5000 fallback for robust local dev
        const fallbackRes = await fetch(\`http://localhost:5000/api/patients/doctors?\${params.toString()}\`);
        if(fallbackRes.ok) {
           const fallbackData = await fallbackRes.json();
           setDoctors(fallbackData);
           return;
        }
        throw new Error('Failed to fetch doctors. Please ensure the backend is running.');
      }
      const data = await res.json();
      setDoctors(data);`;

    const replaceFetch = `  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specialtyFilter) params.append('specialty', specialtyFilter);

      const res = await fetch(\`\${API_BASE}/patients/doctors?\${params.toString()}\`);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      setDoctors(data);`;

    if (content.includes(searchApi)) {
        content = content.replace(searchApi, replaceApi);
        content = content.replace(searchFetch, replaceFetch);
        fs.writeFileSync(findPath, content);
        console.log('Successfully updated FindDoctorsPage API Base and fetch logic');
    } else {
        console.log('Target API string or fetch block not found in FindDoctorsPage.jsx');
    }
} else {
    console.log('FindDoctorsPage.jsx path does not exist:', findPath);
}

// 2. Update patient.controller.js
const controllerPath = path.join(__dirname, 'backend', 'src', 'modules', 'patient', 'patient.controller.js');
if (fs.existsSync(controllerPath)) {
    let content = fs.readFileSync(controllerPath, 'utf8');

    const searchFilters = `    if (search) {
      filters.name = { contains: search };
    }
    if (specialty) {
      filters.specialty = { contains: specialty };
    }`;

    const replaceFilters = `    if (search) {
      filters.name = { contains: search, mode: 'insensitive' };
    }
    if (specialty) {
      filters.specialty = { contains: specialty, mode: 'insensitive' };
    }`;

    if (content.includes(searchFilters)) {
        content = content.replace(searchFilters, replaceFilters);
        fs.writeFileSync(controllerPath, content);
        console.log('Successfully updated patient.controller.js search filters with case-insensitivity');
    } else {
        console.log('Target searchFilters block not found in patient.controller.js');
    }
} else {
    console.log('patient.controller.js path does not exist');
}
