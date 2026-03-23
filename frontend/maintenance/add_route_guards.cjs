const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');

    // 1. Add Navigate import
    const searchImports = `import { BrowserRouter, Routes, Route } from 'react-router-dom';`;
    const replaceImports = `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';`;

    // 2. Add ProtectedRoute component above function App()
    const searchApp = `function App() {`;
    const replaceApp = `const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (user.role !== allowedRole) {
    const redirects = { 'PATIENT': '/patient', 'DOCTOR': '/doctor', 'ADMIN': '/admin' };
    return <Navigate to={redirects[user.role] || '/'} replace />;
  }

  return children;
};

function App() {`;

    // 3. Wrap Patient route
    const searchPatient = `<Route path="/patient" element={<PatientPortalLayout />}>`;
    const replacePatient = `<Route path="/patient" element={<ProtectedRoute allowedRole="PATIENT"><PatientPortalLayout /></ProtectedRoute>}>`;

    // 4. Wrap Admin route
    const searchAdmin = `<Route path="/admin" element={<AdminPortalLayout />}>`;
    const replaceAdmin = `<Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminPortalLayout /></ProtectedRoute>}>`;

    // 5. Wrap Doctor route
    const searchDoctor = `<Route path="/doctor" element={<DoctorPortalLayout />}>`;
    const replaceDoctor = `<Route path="/doctor" element={<ProtectedRoute allowedRole="DOCTOR"><DoctorPortalLayout /></ProtectedRoute>}>`;

    if (content.includes(searchPatient) && content.includes(searchAdmin) && content.includes(searchDoctor)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchApp, replaceApp);
        content = content.replace(searchPatient, replacePatient);
        content = content.replace(searchAdmin, replaceAdmin);
        content = content.replace(searchDoctor, replaceDoctor);
        fs.writeFileSync(appPath, content);
        console.log('Successfully added Route Guards to App.jsx');
    } else {
        console.log('Target Route wrappers not found in App.jsx');
    }
}
