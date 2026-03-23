const fs = require('fs');
const path = require('path');

// 1. Update DoctorPortalLayout.jsx
const layoutPath = path.join(__dirname, 'src', 'doctor-portal', 'DoctorPortalLayout.jsx');
if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf8');
    
    // Inject useState and useEffect into imports
    const searchImports = `import React from 'react';`;
    const replaceImports = `import React, { useState, useEffect } from 'react';`;
    
    const searchState = `  const navigate = useNavigate();
  const doctor = { name: "Dr. Emily Smith", role: "Cardiologist" }; // Mockup`;
  
    const replaceState = `  const navigate = useNavigate();
  const [doctor, setDoctor] = useState({ name: "Doctor", role: "Specialist" });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDoctor({
         name: user.name.startsWith('Dr.') ? user.name : \`Dr. \${user.name}\`,
         role: user.specialty || "Specialist"
      });
    }
  }, []);`;

    if (content.includes(searchState)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchState, replaceState);
        fs.writeFileSync(layoutPath, content);
        console.log('Successfully updated DoctorPortalLayout profile dynamics');
    }
}

// 2. Update DashboardPage.jsx
const dashboardPath = path.join(__dirname, 'src', 'doctor-portal', 'dashboard', 'DashboardPage.jsx');
if (fs.existsSync(dashboardPath)) {
    let content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Inject useState and useEffect into imports
    const searchImports = `import React from 'react';`;
    const replaceImports = `import React, { useState, useEffect } from 'react';`;

    const searchState = `const DashboardPage = () => {
  // Mock data matching the images`;

    const replaceState = `const DashboardPage = () => {
  const [doctorName, setDoctorName] = useState("Doctor");

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const nameOnly = user.name.startsWith('Dr.') ? user.name.replace('Dr.', '').trim() : user.name;
      setDoctorName(nameOnly); // Just the last name or name
    }
  }, []);

  // Mock data matching the images`;

    const searchHeader = `<h1>Good morning, Dr. Smith!</h1>`;
    const replaceHeader = `<h1>Good morning, Dr. {doctorName}!</h1>`;

    if (content.includes(searchHeader)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchState, replaceState);
        content = content.replace(searchHeader, replaceHeader);
        fs.writeFileSync(dashboardPath, content);
        console.log('Successfully updated DashboardPage profile dynamics');
    }
}
