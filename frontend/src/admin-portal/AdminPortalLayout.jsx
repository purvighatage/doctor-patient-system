import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserRound, CalendarCheck, BarChart3, LogOut, Moon, Sun, Activity } from "lucide-react";
import "./AdminPortalLayout.css";

function AdminPortalLayout() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Admin User');
  const [userInitials, setUserInitials] = useState('AU');

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

  const menuItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/admin/doctors", icon: <UserRound size={20} />, label: "Doctors" },
    { path: "/admin/patients", icon: <Users size={20} />, label: "Patients" },
    { path: "/admin/appointments", icon: <CalendarCheck size={20} />, label: "Appointments" },
    { path: "/admin/analytics", icon: <BarChart3 size={20} />, label: "Analytics" },
    { path: "/admin/profile", icon: <UserRound size={20} />, label: "Profile" }
  ];

  const handleLogout = () => {
       sessionStorage.clear();
       window.location.href = "/login";
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
           <Link to="/admin" className="logo" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none'}}>
             <div className="logo-icon">
               <Activity size={20} strokeWidth={2.5} />
             </div>
             <span className="logo-text">MediCare</span>
           </Link>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
             <div className="user-avatar">{userInitials}</div>
             <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">Administrator</span>
             </div>
             <button className="logout-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
             <div className="topbar-left">
                  {/* Can add search here if needed */}
             </div>
             <div className="topbar-right">
                  <button className="theme-toggle" onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <div className="avatar-wrapper">
                    <div className="topbar-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>{userInitials}</div>
                    {isDropdownOpen && (
                      <div className="avatar-dropdown">
                        <Link to="/admin/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                        <button className="dropdown-item logout-btn" onClick={handleLogout}>Sign out</button>
                      </div>
                    )}
                  </div>
             </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="content-area">
             <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminPortalLayout;
