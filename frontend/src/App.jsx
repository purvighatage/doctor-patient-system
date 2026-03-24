import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import FindDoctorsPage from './pages/FindDoctorsPage/FindDoctorsPage';
import PatientPortalLayout from './patient-portal/PatientPortalLayout';
import DashboardPage from './patient-portal/DashboardPage/DashboardPage';
import AppointmentsPage from './patient-portal/AppointmentsPage/AppointmentsPage';
import ProfilePage from './patient-portal/ProfilePage/ProfilePage';
import PatientDoctorsPage from './patient-portal/DoctorsPage/DoctorsPage';
import DoctorDetailPage from './patient-portal/DoctorsPage/DoctorDetailPage';


// Admin Portal Imports
import AdminPortalLayout from './admin-portal/AdminPortalLayout';
import AdminDashboardPage from './admin-portal/DashboardPage/DashboardPage';
import AdminAppointmentsPage from './admin-portal/appointments/AppointmentsPage';
import DoctorsPage from './admin-portal/DoctorsPage/DoctorsPage';
import PatientsPage from './admin-portal/patients/PatientsPage';
import AnalyticsPage from './admin-portal/analytics/AnalyticsPage';
import AdminProfilePage from './admin-portal/profile/ProfilePage';

// Doctor Portal Imports
import DoctorPortalLayout from './doctor-portal/DoctorPortalLayout';
import DoctorDashboardPage from './doctor-portal/dashboard/DashboardPage';
import ChangePasswordPage from './doctor-portal/change-password/ChangePasswordPage';
import DoctorAppointmentsPage from './doctor-portal/appointments/AppointmentsPage';
import DoctorPatientsPage from './doctor-portal/patients/PatientsPage';
import DoctorSlotsPage from './doctor-portal/slots/SlotsPage';
import DoctorProfilePage from './doctor-portal/profile/ProfilePage';
import DoctorAnalyticsPage from './doctor-portal/analytics/AnalyticsPage';

const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('token');

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/find" element={<FindDoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        
        {/* Patient Portal */}
        <Route path="/patient" element={<ProtectedRoute allowedRole="PATIENT"><PatientPortalLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="doctors" element={<PatientDoctorsPage />} />
          <Route path="doctors/:id" element={<DoctorDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />

        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminPortalLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Doctor Portal Change Password */}
        <Route path="/doctor/change-password" element={<ChangePasswordPage />} />

        {/* Doctor Portal */}
        <Route path="/doctor" element={<ProtectedRoute allowedRole="DOCTOR"><DoctorPortalLayout /></ProtectedRoute>}>
          <Route index element={<DoctorDashboardPage />} />
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="appointments" element={<DoctorAppointmentsPage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="slots" element={<DoctorSlotsPage />} />
          <Route path="analytics" element={<DoctorAnalyticsPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
