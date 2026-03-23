import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Search } from 'lucide-react';
import './PatientsPage.css';

const PatientsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Group appointments by patientId
  const patientMap = {};
  appointments.forEach(app => {
    const p = app.patient;
    const pId = app.patientId;

    if (!patientMap[pId]) {
      patientMap[pId] = {
        id: pId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        visitCount: 0,
        lastVisit: null,
        status: app.status // Latest status or overall
      };
    }

    patientMap[pId].visitCount += 1;

    const appDate = new Date(app.slot.startTime);
    if (!patientMap[pId].lastVisit || appDate > new Date(patientMap[pId].lastVisit)) {
      patientMap[pId].lastVisit = app.slot.startTime;
    }
  });

  const patientsList = Object.values(patientMap);

  const filteredPatients = patientsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  return (
    <div className="doctor-patients">
      <div className="page-header">
        <div>
          <h1>My Patients</h1>
          <p>View and manage patients getting treated by you</p>
        </div>
        <div className="search-bar-inline">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading patients...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">No patients found.</div>
      ) : (
        <div className="patients-table-container">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Contact info</th>
                <th>Total Visits</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="patient-name-cell">
                      <div className="avatar-sm">
                        {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item"><Mail size={14} /> <span>{p.email}</span></div>
                      <div className="contact-item"><Phone size={14} /> <span>{p.phone}</span></div>
                    </div>
                  </td>
                  <td>
                    <span className="count-badge">{p.visitCount}</span>
                  </td>
                  <td>
                    <div className="visit-cell">
                      <Calendar size={14} />
                      <span>{new Date(p.lastVisit).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td>
                    <button className="view-profile-btn">View Records</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
