import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';


import { 
  Calendar, Heart, Activity, ArrowRight, Droplets 
} from 'lucide-react';

import './DashboardPage.css';

const DashboardPage = () => {
  const [userName, setUserName] = React.useState('Patient');
  const { appointments } = useOutletContext();


  React.useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Backend User might have .name, or just split email etc.
      if (user.name) setUserName(user.name);
    }
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {userName}!</h1>
        <p>Here's an overview of your health and appointments</p>
      </div>

      {/* Top Stats Grid */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-title">Upcoming Appointments</span>
            <span className="stat-value">{appointments.scheduled.length}</span>
          </div>

          <div className="icon-wrapper blue sm">
            <Calendar size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-title">Health Score</span>
            <span className="stat-value">85%</span>
          </div>
          <div className="icon-wrapper pink sm">
            <Heart size={20} />
          </div>
        </div>
      </div>




      {/* Main Content Split */}

      <div className="dashboard-split">
        
        {/* Left Column */}
        <div className="split-left">
          
          {/* Upcoming Appointments Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h2>Upcoming Appointments</h2>
                <p>Your scheduled consultations</p>
              </div>
              <Link to="/patient/appointments" className="view-all">View all <ArrowRight size={16} /></Link>

            </div>

            <div className="appointment-list">
              {appointments.scheduled.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="icon-wrapper blue sm">
                    <Calendar size={20} />
                  </div>
                  <div className="appointment-info">
                    <h4>{appointment.doctor}</h4>
                    <p>{appointment.specialty}</p>
                    <div className="appointment-time">
                      <Calendar size={14} /> {appointment.date}
                      <span className="time-sep"></span>
                      <Activity size={14} /> {appointment.time}
                    </div>
                  </div>
                  <div className={`status-badge ${appointment.status}`}>{appointment.status}</div>
                </div>
              ))}

              {appointments.scheduled.length === 0 && (
                <p className="empty-text">No upcoming appointments</p>
              )}
            </div>

          </div>

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <Link to="/patient/appointments?book=true" className="action-card">
              <div className="icon-wrapper blue sm">
                <Calendar size={24} />
              </div>
              <div className="action-text">
                <h3>Book Appointment</h3>
                <p>Schedule a visit</p>
              </div>
            </Link>
          </div>



          </div>


        {/* Right Column */}
        <div className="split-right">
          
          {/* Health Summary Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h2>Health Summary</h2>
                <p>Your current health metrics</p>
              </div>
            </div>

            <div className="health-score-section">
              <div className="score-header">
                <span className="score-title">Overall Health Score</span>
                <span className="score-value">85%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '85%' }}></div>
              </div>
              <p className="score-desc">Good - Keep maintaining your healthy lifestyle</p>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <Heart size={16} color="#ef4444" />
                  <span>Heart Rate</span>
                </div>
                <div className="metric-value">
                  <h3>72 <span className="unit">bpm</span></h3>
                  <span className="metric-status">Normal</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Activity size={16} color="#009ca6" />
                  <span>Blood Pressure</span>
                </div>
                <div className="metric-value">
                  <h3>120/80</h3>
                  <span className="metric-status">Normal</span>
                </div>
              </div>
            </div>

            <div className="health-tip">
              <Activity size={20} />
              <div className="tip-content">
                <h4>Health Tip</h4>
                <p>Stay hydrated! Aim for 8 glasses of water per day for optimal health.</p>
              </div>
            </div>
          </div>
        </div>
      </div>




    </div>
  );
};

export default DashboardPage;
