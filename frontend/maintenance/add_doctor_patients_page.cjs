const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');

    const searchImports = `import DoctorAppointmentsPage from './doctor-portal/appointments/AppointmentsPage';`;
    const replaceImports = `import DoctorAppointmentsPage from './doctor-portal/appointments/AppointmentsPage';
import DoctorPatientsPage from './doctor-portal/patients/PatientsPage';`;

    const searchRoute = `<Route path="patients" element={<div>Patients</div>} />`;
    const replaceRoute = `<Route path="patients" element={<DoctorPatientsPage />} />`;

    if (content.includes(searchRoute)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchRoute, replaceRoute);
        fs.writeFileSync(appPath, content);
        console.log('Successfully added DoctorPatientsPage routes to App.jsx');
    } else {
        console.log('Target Route string placeholder not found in App.jsx');
    }
} else {
    console.log('App.jsx path does not exist');
}
