import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, MessageSquare, Settings, LogOut, Activity, Clock, User, BarChart, Sun, Moon } from 'lucide-react';
import './DoctorPortalLayout.css';

const DoctorPortalLayout = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState({ name: "Doctor", role: "Specialist" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('D');

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const docName = user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`;
      setDoctor({
         name: docName,
         role: user.specialty || "Specialist",
         photo: user.doctor?.photo || ""
      });
      const initials = docName.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase();
      setUserInitials(initials);
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

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="doctor-portal-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/doctor" className="logo">
            <div className="logo-icon">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">MediCare</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/doctor/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/doctor/appointments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Appointments</span>
          </NavLink>
          <NavLink to="/doctor/slots" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock size={20} />
            <span>Slots</span>
          </NavLink>
          <NavLink to="/doctor/patients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Patients</span>
          </NavLink>
          <NavLink to="/doctor/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart size={20} />
            <span>Analytics</span>
          </NavLink>
          <NavLink to="/doctor/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => navigate('/doctor/profile')} style={{ cursor: 'pointer' }}>
            <div className="avatar">
               {doctor.photo ? <img src={doctor.photo} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} /> : userInitials}
            </div>
            <div className="user-info">
              <h4>{doctor.name}</h4>
              <p>{doctor.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="portal-topbar">
          <div className="topbar-right">
            <button className="icon-btn dark-mode-toggle" aria-label="Toggle Dark Mode" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="avatar-wrapper">
              <div className="avatar topbar-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {doctor.photo ? <img src={doctor.photo} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} /> : userInitials}
              </div>
              {isDropdownOpen && (
                <div className="avatar-dropdown">
                  <Link to="/doctor/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DoctorPortalLayout;
