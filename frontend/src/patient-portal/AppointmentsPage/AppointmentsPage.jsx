import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';


import { Calendar, Video, MapPin, Plus } from 'lucide-react';
import './AppointmentsPage.css';

/**
 * AppointmentsPage Component
 * 
 * A comprehensive management interface for patient appointments.
 * Functional areas include:
 * - Tabbed views for Scheduled, Cancelled, and Completed appointments.
 * - Detailed appointment cards with doctor info, time, and consultation type (In-Person/Video).
 * - Appointment actions: Reschedule, Cancel, and Join Call (if applicable).
 * - A sophisticated booking modal featuring a dynamic calendar and time slot picker.
 */
const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const todayDate = new Date();
  const [selectedDate, setSelectedDate] = useState(todayDate.getDate()); 
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth()); // 0-indexed
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [reason, setReason] = useState('');

  const { appointments, setAppointments } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const API_BASE = '/api';

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentYear > todayDate.getFullYear() || (currentYear === todayDate.getFullYear() && currentMonth > todayDate.getMonth())) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isPrevDisabled = currentYear === todayDate.getFullYear() && currentMonth === todayDate.getMonth();

  useEffect(() => {
    if (!selectedDoctor) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE}/patients/doctors/${selectedDoctor}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      }
    };
    fetchSlots();
  }, [selectedDoctor]);

  // Filter slots for the selected date
  const filteredSlots = availableSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return slotDate.getDate() === selectedDate;
  });

  /**
   * Finalizes the appointment booking process.
   * Performs:
   * - Mandatory field validation.
   * - "Past time" validation for same-day bookings.
   * - Client-side collision detection for existing appointments.
   * - Backend API synchronization for atomic booking and slot reservation.
   */
  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
      alert("Please fill in all selection fields");
      return;
    }

    // Validation for Past Time on Today
    const today = new Date();
    const isToday = selectedDate === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    if (isToday) {
         const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
         if (timeMatch) {
              let hours = parseInt(timeMatch[1]);
              const minutes = parseInt(timeMatch[2]);
              const ampm = timeMatch[3].toUpperCase();
              
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
              
              const selectedDateTime = new Date();
              selectedDateTime.setHours(hours, minutes, 0, 0);
              
              if (selectedDateTime < today) {
                   alert("The selected time slot has already passed for today. Please pick a future time.");
                   return;
              }
         }
    }

    // Double Booking Conflict Validation
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const targetDateStr = `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`;
    const isConflict = appointments.scheduled && appointments.scheduled.some(app => {
         const appDateClean = app.date.includes(',') && !app.date.startsWith('March')
           ? app.date.split(',').slice(1).join(',').trim()
           : app.date;
         return appDateClean === targetDateStr && app.time === selectedTime;
    });

    if (isConflict) {
         alert("You already have an appointment booked for this date and time. Please pick another slot.");
         return;
    }

    const doc = doctors.find(d => d.id === parseInt(selectedDoctor));
    const newApp = {
      id: Date.now(),
      doctorId: doc ? doc.id : null,
      doctor: doc ? (doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`) : 'Doctor',
      specialty: doc ? doc.specialty : 'Consultation',
      date: targetDateStr,
      time: selectedTime,
      type: consultationType,
      status: 'scheduled'
    };
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = 10; let minutes = 0;
      if (timeMatch) {
           hours = parseInt(timeMatch[1]);
           minutes = parseInt(timeMatch[2]);
           if (timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
           if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      const slotDate = new Date(currentYear, currentMonth, selectedDate, 12, 0, 0); 
      const startTimeObj = new Date(currentYear, currentMonth, selectedDate, hours, minutes, 0);

      const res = await fetch(`${API_BASE}/patients/appointments`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({ 
              slotId: selectedSlotId ? parseInt(selectedSlotId) : undefined,
              doctorId: parseInt(selectedDoctor),
              date: slotDate.toISOString(),
              startTime: startTimeObj.toISOString()
         })
      });

      if (res.ok) {
           const data = await res.json();
           const bookedApp = { ...newApp, id: data.appointment ? data.appointment.id : Date.now() };
           
           setAppointments(prev => ({
             ...prev,
             scheduled: [...prev.scheduled, bookedApp]
           }));
           setIsModalOpen(false);
           // Reset fields
           setSelectedDoctor('');
           setSelectedSlotId('');
           setSelectedTime('');
           setConsultationType('');
           setReason('');
      } else {
           const errData = await res.json().catch(() => ({}));
           alert("Failed to book on backend: " + (errData.message || "Unknown Error"));
      }
    } catch (err) {
       console.error("Booking error:", err);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_BASE}/patients/doctors`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };
    fetchDoctors();
  }, []);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('book') === 'true') {
      setIsModalOpen(true);
    }
    const doctorId = params.get('doctorId');
    if (doctorId) {
      setSelectedDoctor(doctorId);
    }
  }, [location]);



  /**
   * Cancels a scheduled appointment.
   * - Checks for a 2-hour minimum cancellation lead time.
   * - Performs a PUT request to the backend.
   * - Moves the appointment from 'scheduled' to 'cancelled' list in local state.
   * @param {number|string} id - The unique ID of the appointment to cancel.
   */
  const handleCancel = async (id) => {
    try {
      const appointment = activeAppointments.find(app => app.id === id);
      if (appointment && appointment.startTime) {
         const appTime = new Date(appointment.startTime);
         const now = new Date();
         const diffMs = appTime - now;
         const diffHours = diffMs / (1000 * 60 * 60);
         if (diffHours < 2 && diffHours > 0) { // check if it's in future and < 2 hours
            alert("You cannot cancel an appointment less than 2 hours before the start time.");
            return;
         }
      }

      const token = sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/patients/appointments/${id}/cancel`, {
           method: 'PUT',
           headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
           const cancelledAppointment = { ...appointment, status: 'cancelled' };
           setAppointments(prev => ({
             ...prev,
             [activeTab]: prev[activeTab].filter(app => app.id !== id),
             cancelled: [...prev.cancelled, cancelledAppointment]
           }));
      } else {
           const errData = await res.json().catch(() => ({}));
           alert("Failed to cancel: " + (errData.message || "Unknown Error"));
      }
    } catch (err) {
       console.error("Cancel error:", err);
    }
  };

  /**
   * Triggers the rescheduling flow by opening the booking modal.
   * Automatically selects the doctor associated with the existing appointment.
   * @param {Object} appointment - The appointment object to reschedule.
   */
  const handleReschedule = (appointment) => {
       if (appointment.doctorId) {
            setSelectedDoctor(appointment.doctorId.toString());
       } else if (appointment.doctor) {
            const cleanName = appointment.doctor.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
            const foundDoc = doctors.find(d => d.name.trim().toLowerCase() === cleanName);
            if (foundDoc) {
                 setSelectedDoctor(foundDoc.id.toString());
            }
       }
       setIsModalOpen(true);
  };

  const activeAppointments = appointments[activeTab] || [];


  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage your medical appointments</p>
        </div>
        <button className="book-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="appointments-tabs">
        <button 
          className={`tab-item ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled ({appointments.scheduled.length})
        </button>
        <button 
          className={`tab-item ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({appointments.cancelled.length})
        </button>
        <button 
          className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({appointments.completed.length})
        </button>
      </div>

      <div className="appointments-list">
        {activeAppointments.map((appointment) => (
          <div key={appointment.id} className="appointment-detail-card">
            <div className="card-header">
              <div className="doctor-info">
                <h3>{appointment.doctor}</h3>
                <p>{appointment.specialty}</p>
              </div>
              <span className={`status-badge ${appointment.status}`}>
                {appointment.status}
              </span>
            </div>

            <div className="card-body">
              <div className="info-row">
                <Calendar size={16} />
                <span>{appointment.date}</span>
              </div>
              <div className="info-row">
                <div className="time-icon">🕒</div>
                <span>{appointment.time}</span>
              </div>
              <div className="info-row">
                {appointment.type.includes('Video') ? <Video size={16} /> : <MapPin size={16} />}
                <span>{appointment.type}</span>
              </div>
            </div>

            <div className="card-actions">
              <button className="action-btn secondary" onClick={() => handleReschedule(appointment)}>Reschedule</button>
              <button className="action-btn secondary" onClick={() => handleCancel(appointment.id)}>Cancel</button>
              {appointment.hasCall && (

                <button className="action-btn primary join-call">Join Call</button>
              )}
            </div>
          </div>
        ))}

        {activeAppointments.length === 0 && (
          <div className="empty-state">
            <Calendar size={48} className="empty-icon" />
            <h3>No appointments found</h3>
            <p>You don't have any {activeTab} appointments at the moment.</p>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>Book New Appointment</h2>
                <p>Schedule a consultation with your preferred doctor</p>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Select Doctor <span className="required-asterisk">*</span></label>
                <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                  <option value="" disabled>Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>Dr. {doctor.name} ({doctor.specialty})</option>
                  ))}
                </select>

              </div>

              <div className="form-group">
                <label>Select Date <span className="required-asterisk">*</span></label>
                <div className="calendar-box">
                  <div className="calendar-header">
                    <button className="cal-nav-btn" onClick={handlePrevMonth} disabled={isPrevDisabled} style={{ opacity: isPrevDisabled ? 0.5 : 1, cursor: isPrevDisabled ? 'not-allowed' : 'pointer' }}>&lt;</button>
                    <span>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button className="cal-nav-btn" onClick={handleNextMonth}>&gt;</button>
                  </div>
                  <div className="calendar-grid">
                    <div className="calendar-day">Su</div>
                    <div className="calendar-day">Mo</div>
                    <div className="calendar-day">Tu</div>
                    <div className="calendar-day">We</div>
                    <div className="calendar-day">Th</div>
                    <div className="calendar-day">Fr</div>
                    <div className="calendar-day">Sa</div>

                    {/* Array of dates */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
                      const isPastDate = currentYear === todayDate.getFullYear() && currentMonth === todayDate.getMonth() && date < todayDate.getDate();
                      return (
                        <button 
                          key={date} 
                          className={`calendar-date ${date === selectedDate ? 'active' : ''}`}
                          onClick={() => setSelectedDate(date)}
                          disabled={isPastDate}
                        >
                          {date}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Time Slot <span className="required-asterisk">*</span></label>
                  <select 
                    value={selectedSlotId || selectedTime} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('slot-')) {
                        const sId = val.replace('slot-', '');
                        setSelectedSlotId(sId);
                        const slot = filteredSlots.find(s => s.id === parseInt(sId));
                        if (slot) {
                          const timeStr = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          setSelectedTime(timeStr);
                        }
                      } else {
                        setSelectedSlotId('');
                        setSelectedTime(val);
                      }
                    }}
                  >
                    <option value="" disabled>Select time</option>
                    <optgroup label="Dynamic Slots">
                      {filteredSlots.map(slot => (
                        <option key={slot.id} value={`slot-${slot.id}`}>
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </option>
                      ))}
                      {filteredSlots.length === 0 && <option disabled>No slots for this date</option>}
                    </optgroup>
                    <optgroup label="Standard Times">
                      <option value="10:00AM">10:00 AM</option>
                      <option value="11:30AM">11:30 AM</option>
                      <option value="02:30PM">02:30 PM</option>
                    </optgroup>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Consultation Type <span className="required-asterisk">*</span></label>
                  <select value={consultationType} onChange={(e) => setConsultationType(e.target.value)}>
                    <option value="" disabled>Select type</option>
                    <option value="In-Person">In-Person Consultation</option>
                    <option value="Video">Video Consultation</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea 
                  placeholder="Describe your symptoms or reason for consultation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button className="submit-book-btn" onClick={handleBook}>
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AppointmentsPage;
