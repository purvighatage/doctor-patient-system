const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');

    const searchImports = `import ChangePasswordPage from './doctor-portal/change-password/ChangePasswordPage';`;
    const replaceImports = `import ChangePasswordPage from './doctor-portal/change-password/ChangePasswordPage';
import DoctorAppointmentsPage from './doctor-portal/appointments/AppointmentsPage';`;

    const searchRoute = `<Route path="appointments" element={<div>Appointments</div>} />`;
    const replaceRoute = `<Route path="appointments" element={<DoctorAppointmentsPage />} />`;

    if (content.includes(searchRoute)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchRoute, replaceRoute);
        fs.writeFileSync(appPath, content);
        console.log('Successfully added DoctorAppointmentsPage routes to App.jsx');
    } else {
        console.log('Target Route string placeholder not found in App.jsx');
    }
} else {
    console.log('App.jsx path does not exist');
}
