import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Star, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import './DashboardPage.css';

/**
 * DashboardPage Component (Doctor Portal)
 * 
 * The primary landing page for authenticated doctors.
 * Provides:
 * - Real-time statistics (Today's Appointments, Unique Patients, Pending Actions).
 * - A prioritized "Today's Schedule" list with direct consultation actions.
 * - Interactive weekly activity visualization using Recharts.
 * - Quick-link shortcuts for common tasks (Managing slots, records, etc.).
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("Doctor");

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const nameOnly = user.name.startsWith('Dr.') ? user.name.replace('Dr.', '').trim() : user.name;
      setDoctorName(nameOnly); // Just the last name or name
    }
  }, []);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the doctor's appointment list from the backend.
   * Implements a polling mechanism (every 30 seconds) to ensure data freshness.
   */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/doctors/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();

    const intervalId = setInterval(fetchAppointments, 30000); // Poll every 30s
    return () => clearInterval(intervalId);
  }, []);

  // Compute stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppts = appointments.filter(app => {
    const appDate = new Date(app.slot.startTime);
    appDate.setHours(0, 0, 0, 0);
    return appDate.getTime() === today.getTime() && app.status === 'BOOKED';
  });

  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;
  const pendingAppts = appointments.filter(a => a.status === 'PENDING').length;

  const stats = [
    { title: "Today's Appointments", value: todayAppts.length.toString(), icon: <Calendar size={24} />, trend: null, color: "#e3f2fd", iconColor: "#1e88e5" },
    { title: "Total Patients", value: uniquePatients.toString(), icon: <Users size={24} />, trend: null, color: "#e8f5e9", iconColor: "#43a047" },
    { title: "Pending", value: pendingAppts.toString(), icon: <Clock size={24} />, trend: null, color: "#fff8e1", iconColor: "#ffb300" },
    { title: "Rating", value: "4.8/5.0", icon: <Star size={24} />, trend: null, color: "#f3e5f5", iconColor: "#8e24aa" }
  ];

  const schedule = todayAppts.map(app => ({
    id: app.id,
    name: app.patient.name,
    condition: "Scheduled Consultation",
    time: new Date(app.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    initial: app.patient.name.split(' ').map(n => n[0]).join('').toUpperCase()
  }));

  // Build chartData dynamically
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = days.map(d => ({ day: d, appointments: 0 }));
  appointments.forEach(a => {
      const dayIdx = new Date(a.slot.startTime).getDay();
      chartData[dayIdx].appointments += 1;
  });

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h1>Good morning, Dr. {doctorName}!</h1>
        <p>You have {todayAppts.length} appointments today</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ backgroundColor: stat.color, color: stat.iconColor }}>
                {stat.icon}
              </div>
              {stat.trend && <span className="stat-trend trend-up">{stat.trend}</span>}
            </div>
            <div className="stat-card-body">
              <p className="stat-title">{stat.title}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid row */}
      <div className="dashboard-grid">
        {/* Today's Schedule */}
        <div className="grid-item schedule-box">
          <div className="grid-header">
            <h3>Today's Schedule</h3>
            <button className="view-all-btn" onClick={() => navigate('/doctor/appointments')}>
              <span>View all</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="grid-sub">Your appointments for today</p>
          
          <div className="schedule-list">
            {loading ? <div className="loading-sm">Loading today's schedule...</div> : schedule.length === 0 ? <div className="empty-sm">No appointments for today.</div> : schedule.map(app => (
              <div className="schedule-card" key={app.id}>
                <div className="patient-info">
                  <div className="patient-avatar">{app.initial}</div>
                  <div>
                    <h4>{app.name}</h4>
                    <p>{app.condition}</p>
                  </div>
                </div>
                <div className="schedule-actions">
                  <span className="time-badge">{app.time}</span>
                  <div className="action-row">
                    <button className="btn-outline">View Details</button>
                    <button className="btn-primary">Start Consultation</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="grid-item activity-box">
          <div className="grid-header">
            <h3>Weekly Activity</h3>
          </div>
          <p className="grid-sub">Appointments over the past week</p>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#b0bec5" fontSize={12} />
                <YAxis stroke="#b0bec5" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="appointments" stroke="#00bcd4" strokeWidth={2} fillOpacity={1} fill="url(#colorAppts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Shortcuts (Image 2) */}
      <div className="shortcuts-grid">
        <div className="shortcut-card" onClick={() => navigate('/doctor/appointments')} style={{ cursor: 'pointer' }}>
          <div className="shortcut-icon"><Calendar size={24} /></div>
          <div>
            <h4>Manage Appointments</h4>
            <p>View & update schedule</p>
          </div>
        </div>
        <div className="shortcut-card" onClick={() => navigate('/doctor/patients')} style={{ cursor: 'pointer' }}>
          <div className="shortcut-icon"><Users size={24} /></div>
          <div>
            <h4>Patient Records</h4>
            <p>Access medical history</p>
          </div>
        </div>
        <div className="shortcut-card" onClick={() => navigate('/doctor/slots')} style={{ cursor: 'pointer' }}>
          <div className="shortcut-icon"><Clock size={24} /></div>
          <div>
            <h4>Set Availability</h4>
            <p>Update your schedule</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
