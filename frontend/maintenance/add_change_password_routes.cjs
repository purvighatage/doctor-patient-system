const fs = require('fs');
const path = require('path');

// 1. Update LoginPage.jsx
const loginPath = path.join(__dirname, 'src', 'pages', 'LoginPage', 'LoginPage.jsx');
if (fs.existsSync(loginPath)) {
    let content = fs.readFileSync(loginPath, 'utf8');
    
    const search = `      if (userRole === 'PATIENT') {
        navigate('/patient');
      } else if (userRole === 'DOCTOR') {
        navigate('/doctor'); 
      } else if (userRole === 'ADMIN') {`;

    const replace = `      if (userRole === 'PATIENT') {
        navigate('/patient');
      } else if (userRole === 'DOCTOR') {
        if (data.user.mustChangePassword) {
           navigate('/doctor/change-password');
        } else {
           navigate('/doctor'); 
        }
      } else if (userRole === 'ADMIN') {`;

    if (content.includes(search)) {
        content = content.replace(search, replace);
        fs.writeFileSync(loginPath, content);
        console.log('Successfully updated LoginPage redirect logic');
    } else {
        console.log('Target LoginPage redirect block not found');
    }
}

// 2. Update App.jsx
const appPath = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');

    const searchImports = `import DoctorDashboardPage from './doctor-portal/dashboard/DashboardPage';`;
    const replaceImports = `import DoctorDashboardPage from './doctor-portal/dashboard/DashboardPage';
import ChangePasswordPage from './doctor-portal/change-password/ChangePasswordPage';`;

    const searchRoute = `        {/* Doctor Portal */}
        <Route path="/doctor" element={<DoctorPortalLayout />}>`;

    const replaceRoute = `        {/* Doctor Portal Change Password */}
        <Route path="/doctor/change-password" element={<ChangePasswordPage />} />

        {/* Doctor Portal */}
        <Route path="/doctor" element={<DoctorPortalLayout />}>`;

    if (content.includes(searchImports) && content.includes(searchRoute)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchRoute, replaceRoute);
        fs.writeFileSync(appPath, content);
        console.log('Successfully added ChangePasswordPage routes to App.jsx');
    } else {
        console.log('Target App.jsx blocks not found');
    }
}
