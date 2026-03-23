const fs = require('fs');
const path = require('path');

// 1. Fix PatientPortalLayout.jsx
const layoutPath = path.join(__dirname, 'src', 'patient-portal', 'PatientPortalLayout.jsx');
if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf8');
    const searchLayout = `const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const res = await fetch('/api/patients/appointments', {
         headers: { 'Authorization': \`Bearer \${user.token}\` } // assuming token in user object or cookie
      });`;
    
    const replaceLayout = `const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/patients/appointments', {
         headers: { 'Authorization': \`Bearer \${token}\` }
      });`;
      
    if (content.includes(searchLayout)) {
        content = content.replace(searchLayout, replaceLayout);
        fs.writeFileSync(layoutPath, content);
        console.log('Fixed token in PatientPortalLayout.jsx');
    } else {
        console.log('Target inside PatientPortalLayout.jsx not found');
    }
}

// 2. Fix AppointmentsPage.jsx
const pagePath = path.join(__dirname, 'src', 'patient-portal', 'AppointmentsPage', 'AppointmentsPage.jsx');
if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Fix in handleBook
    const searchBook = `const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await fetch(\`\${API_BASE}/patients/appointments\`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': \`Bearer \${user.token}\`
         },`;
         
    const replaceBook = `const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(\`\${API_BASE}/patients/appointments\`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': \`Bearer \${token}\`
         },`;

    // Fix in handleCancel
    const searchCancel = `const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await fetch(\`\${API_BASE}/patients/appointments/\${id}/cancel\`, {
           method: 'PUT',
           headers: { 'Authorization': \`Bearer \${user.token}\` }
      });`;

    const replaceCancel = `const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(\`\${API_BASE}/patients/appointments/\${id}/cancel\`, {
           method: 'PUT',
           headers: { 'Authorization': \`Bearer \${token}\` }
      });`;

    if (content.includes(searchBook)) {
        content = content.replace(searchBook, replaceBook);
    } else { console.log('Book search not found'); }
    
    if (content.includes(searchCancel)) {
        content = content.replace(searchCancel, replaceCancel);
    } else { console.log('Cancel search not found'); }

    fs.writeFileSync(pagePath, content);
    console.log('Fixed tokens in AppointmentsPage.jsx');
}
