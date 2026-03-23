import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';

import { 
  Activity, LayoutDashboard, Calendar, 
  Settings, Moon, Sun, User, Users 
} from 'lucide-react';


import './PatientPortalLayout.css';

const PatientPortalLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('Patient');
  const [userInitials, setUserInitials] = useState('P');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };


  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name) {
        setUserName(user.name);
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        setUserInitials(initials);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const [appointments, setAppointments] = useState({ scheduled: [], cancelled: [], completed: [] });

  const fetchAppointments = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/patients/appointments', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
         const data = await res.json();
         // Backend returns appointment arrays
         const scheduled = data.filter(a => a.status === 'BOOKED' || a.status === 'PENDING').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'scheduled',
             slotId: a.slotId,
             startTime: a.slot ? a.slot.startTime : null,
             doctorId: a.doctor ? a.doctor.id : null
         }));

         const completed = data.filter(a => a.status === 'COMPLETED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'completed',
             slotId: a.slotId,
             startTime: a.slot ? a.slot.startTime : null,
             doctorId: a.doctor ? a.doctor.id : null
          }));

         const cancelled = data.filter(a => a.status === 'CANCELLED').map(a => ({
             id: a.id,
             doctor: a.doctor ? a.doctor.name : 'Unknown',
             specialty: a.doctor ? a.doctor.specialty : 'Consultation',
             date: a.slot ? new Date(a.slot.startTime).toLocaleDateString() : 'N/A',
             time: a.slot ? new Date(a.slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
             type: 'Consultation',
             status: 'cancelled',
             slotId: a.slotId,
             startTime: a.slot ? a.slot.startTime : null,
             doctorId: a.doctor ? a.doctor.id : null
          }));

         setAppointments({ scheduled, cancelled, completed });
      }
    } catch (err) {
       console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="portal-layout">

      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">MediCare</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/patient" end className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/patient/appointments" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Calendar size={20} />
            <span>Appointments</span>
          </NavLink>
          <NavLink to="/patient/doctors" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            <span>Doctors</span>
          </NavLink>

          <NavLink to="/patient/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>

            <User size={20} />
            <span>Profile</span>
          </NavLink>

        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-sm">
            <div className="avatar nav-avatar">{userInitials}</div>
            <span className="user-name">{userName}</span>
          </div>
          <button className="cookie-btn-sidebar">Manage cookies or opt out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main">
        {/* Topbar */}
        <header className="portal-topbar">
          <div className="topbar-right">
            <button className="icon-btn dark-mode-toggle" aria-label="Toggle Dark Mode" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="avatar-wrapper">
              <div className="avatar topbar-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>{userInitials}</div>
              {isDropdownOpen && (
                <div className="avatar-dropdown">
                  <Link to="/patient/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                  <button className="dropdown-item logout-btn" onClick={handleSignOut}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Page Content */}
        <div className="portal-content">
          <Outlet context={{ appointments, setAppointments }} />
        </div>

      </div>
    </div>
  );
};

export default PatientPortalLayout;
