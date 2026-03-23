import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import './AppointmentsPage.css';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
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
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/doctors/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert(`Appointment marked as ${newStatus}`);
        fetchAppointments(); // Refresh
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  // Filter logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredAppointments = appointments.filter(app => {
    const appDate = new Date(app.slot.startTime);
    appDate.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return appDate >= today && app.status === 'BOOKED';
    } else if (activeTab === 'past') {
      return appDate < today || app.status === 'COMPLETED' || app.status === 'CANCELLED';
    }
    return true; // 'all'
  });

  return (
    <div className="doctor-appointments">
      <div className="page-header">
        <h1>Appointments</h1>
        <p>Manage your schedule and patient visits</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
        <button className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past / Completed</button>
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
      </div>

      {loading ? (
        <div className="loading-state">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">No appointments found for this view.</div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map(app => (
            <div className="app-card" key={app.id}>
              <div className="app-card-header">
                <div className="patient-profile">
                  <div className="patient-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <h4>{app.patient.name}</h4>
                    <p>{app.patient.email}</p>
                    <p className="phone">{app.patient.phone}</p>
                  </div>
                </div>
                <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
              </div>

              <div className="app-card-body">
                <div className="info-row">
                  <Calendar size={16} />
                  <span>{new Date(app.slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="info-row">
                  <Clock size={16} />
                  <span>
                    {new Date(app.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(app.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="app-card-actions">
                {app.status === 'BOOKED' && (
                  <>
                    <button className="btn-success" onClick={() => updateStatus(app.id, 'COMPLETED')}>
                      <CheckCircle size={16} />
                      <span>Complete</span>
                    </button>
                    <button className="btn-danger" onClick={() => updateStatus(app.id, 'CANCELLED')}>
                      <XCircle size={16} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
