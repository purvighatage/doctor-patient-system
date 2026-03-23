import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, MessageSquare, Settings, LogOut, Activity, Clock } from 'lucide-react';
import './DoctorPortalLayout.css';

const DoctorPortalLayout = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState({ name: "Doctor", role: "Specialist" });

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDoctor({
         name: user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`,
         role: user.specialty || "Specialist"
      });
    }
  }, []);

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
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">DES</div>
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

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            {/* Can leave empty or place a search mockup */}
          </div>
          <div className="top-actions">
            <button className="action-icon">🔔</button>
            <button className="action-icon">🌙</button>
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
