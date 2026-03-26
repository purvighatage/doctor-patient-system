import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import './AppointmentsPage.css';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/admins/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const searchLow = searchTerm.toLowerCase();
    const patientName = app.patient?.name?.toLowerCase() || '';
    const doctorName = app.doctor?.name?.toLowerCase() || '';//optional chaining to handle missing doctor info
    return patientName.includes(searchLow) || doctorName.includes(searchLow);
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      case 'PENDING': return 'pending';
      default: return 'booked';
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">View all appointments across your hospital</p>
        </div>
      </div>

      <div className="appointments-toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spinner" />
          <p>Loading appointments...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="patient-info">
                        <span className="name-primary">{app.patient?.name || 'Unknown Patient'}</span>
                        <span className="text-secondary">{app.patient?.email || 'No email provided'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="doctor-info">
                        <span className="name-primary">Dr. {app.doctor?.name || 'Unknown'}</span>
                        <span className="text-secondary">{app.doctor?.specialty || 'General'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-time-info">
                        <span className="name-primary">
                          {app.slot ? new Date(app.slot.date).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="text-secondary">
                          {app.slot ? (
                            `${new Date(app.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(app.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          ) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
                    {searchTerm ? 'No appointments found matching your search.' : 'No appointments available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
