import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import './SlotsPage.css';

/**
 * DoctorSlotsPage Component
 * 
 * The primary interface for managing consulting availability.
 * Functional areas:
 * - View existing time slots with booking status (Available vs. Booked).
 * - Create new availability windows with date and time range selection.
 * - Delete unbooked slots to adjust the doctor's schedule.
 * - Real-time validation for slot overlaps on the backend.
 */
const DoctorSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/doctors/slots', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
         // The backend returns { slots: [...] } based on doctor.controller.js implementation
         // oh wait, let's verify if the backend returns array directly or { slots }.
         // Most doctor endpoints return the array directly or an object. I'll just handle both.
         const data = await res.json();
         setSlots(data.slots || data || []);
      } else {
        console.error('Failed to fetch slots');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Processes the creation of a new availability slot.
   * - Sends date, start time, and end time to the backend.
   * - Handles overlap validation errors and success notifications.
   * - Refreshes the local slot list upon successful creation.
   * @param {Object} e - Submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = sessionStorage.getItem('token');
      
      const res = await fetch('/api/doctors/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Slot created successfully!');
        setFormData({ date: '', startTime: '', endTime: '' });
        fetchSlots(); // Refresh list
        setTimeout(() => {
             setShowForm(false);
             setSuccess(null);
        }, 1500);
      } else {
        setError(data.message || 'Failed to create slot. It may overlap with an existing slot.');
      }
    } catch (err) {
      console.error("Error creating slot:", err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/doctors/slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Remove from UI immediately
        setSlots(prev => prev.filter(slot => slot.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete slot. It might be booked already.');
      }
    } catch (err) {
      console.error("Error deleting slot:", err);
      alert('An error occurred while deleting the slot.');
    }
  };

  return (
    <div className="slots-container">
      <div className="slots-header">
        <div>
          <h1 className="page-title">Availability Slots</h1>
          <p className="page-subtitle">Manage your consulting hours and availability</p>
        </div>
        {!showForm && (
          <button className="add-slot-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Add New Slot
          </button>
        )}
      </div>

      {showForm && (
        <div className="slot-form-container">
          <div className="slot-form-header">
            <h3>Create New Slot</h3>
            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
          </div>
          <form className="slot-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input 
                type="time" 
                name="startTime" 
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input 
                type="time" 
                name="endTime" 
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitLoading}>
                {submitLoading ? <Loader2 size={18} className="spinner" /> : 'Save Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spinner" />
          <p>Loading your slots...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="slots-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.length > 0 ? (
                slots.map((slot) => {
                  const dateStr = new Date(slot.date).toLocaleDateString();
                  const startTimeStr = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTimeStr = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={slot.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                          <CalendarIcon size={16} style={{ color: 'var(--text-light)' }} />
                          {dateStr}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} style={{ color: 'var(--text-light)' }} />
                          {startTimeStr} - {endTimeStr}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${slot.booked ? 'booked' : 'available'}`}>
                          {slot.booked ? 'Booked' : 'Available'}
                        </span>
                      </td>
                      <td>
                        {!slot.booked && (
                          <button 
                            className="action-btn-danger" 
                            onClick={() => handleDelete(slot.id)}
                            title="Delete Slot"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
                    You haven't set up any availability slots yet.
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

export default DoctorSlotsPage;
