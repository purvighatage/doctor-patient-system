import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Star, Clock, MapPin, Calendar, Heart, Share2, Award, Briefcase, DollarSign } from 'lucide-react';
import Skeleton from '../../components/Skeleton/Skeleton';
import './DoctorDetailPage.css';

/**
 * DoctorDetailPage Component
 * 
 * Displays a granular profile of a specific medical professional.
 * Includes:
 * - Professional hero with name, specialty, and ratings.
 * - Detailed biography and qualifications section.
 * - Physical location/clinic information with clinic hours.
 * - Persistent booking sidebar with fee information and direct "Book" action.
 */
const DoctorDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [booking, setBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await fetch(`/api/patients/doctors/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDoctor(data);
                } else {
                    console.error("Failed to fetch doctor details");
                }
            } catch (error) {
                console.error("Error fetching doctor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const handleConfirmBooking = async () => {
        if (!selectedSlotId) return;
        setBooking(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/patients/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ slotId: selectedSlotId })
            });
            const data = await response.json();
            if (response.ok) {
                setBookingSuccess(true);
                alert("Appointment booked successfully!");
                // Refresh doctor data to show slot as booked/removed
                const res = await fetch(`/api/patients/doctors/${id}`);
                const updatedDoctor = await res.json();
                setDoctor(updatedDoctor);
                setSelectedSlotId(null);
            } else {
                alert(data.message || "Booking failed");
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            alert("An error occurred during booking.");
        } finally {
            setBooking(false);
        }
    };

    const nextAvailableSlot = doctor?.slots?.length > 0 ? doctor.slots[0] : null;

    if (loading) {
        return (
            <div className="doctor-detail-container">
                <Skeleton type="doctor-detail" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="error-state">
                <h2>Doctor not found</h2>
                <button onClick={() => navigate(-1)} className="btn-outline">
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
        );
    }

    return (
        <div className="doctor-detail-container">
            <button onClick={() => navigate(-1)} className="back-btn">
                <ArrowLeft size={18} />
                <span>Back to Doctors</span>
            </button>

            <div className="detail-grid">
                {/* Left Column: Doctor Info */}
                <div className="detail-main">
                    <div className="doctor-hero-card">
                        <div className="doctor-hero-top">
                            <div className="detail-avatar">
                                {doctor.photo ? (
                                    <img src={doctor.photo} alt={doctor.name} />
                                ) : (
                                    <User size={60} />
                                )}
                            </div>
                            <div className="doctor-hero-info">
                                <div className="name-row">
                                    <h1>Dr. {doctor.name}</h1>
                                    <span className="status-badge">Available</span>
                                </div>
                                <p className="specialty-title">{doctor.specialty}</p>
                                <div className="rating-row">
                                    <Star size={16} fill="#fb6f92" color="#fb6f92" />
                                    <Star size={16} fill="#fb6f92" color="#fb6f92" />
                                    <Star size={16} fill="#fb6f92" color="#fb6f92" />
                                    <Star size={16} fill="#fb6f92" color="#fb6f92" />
                                    <Star size={16} fill="#e0e0e0" color="#e0e0e0" />
                                    <span className="review-count">(128 Reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="doctor-hero-actions">
                             <button className="icon-btn"><Heart size={20} /></button>
                             <button className="icon-btn"><Share2 size={20} /></button>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3><Award size={20} /> About & Qualifications</h3>
                        <p className="description">
                            Dr. {doctor.name} is a highly skilled {doctor.specialty} with over {doctor.experience} years of experience in the field. 
                            Known for a patient-centric approach and expertise in advanced medical procedures.
                        </p>
                        <div className="qualification-grid">
                            <div className="q-item">
                                <span className="label">Qualifications</span>
                                <span className="value">{doctor.qualifications || 'MBBS, MD'}</span>
                            </div>
                            <div className="q-item">
                                <span className="label">Experience</span>
                                <span className="value">{doctor.experience || 5} Years</span>
                            </div>
                            <div className="q-item">
                                <span className="label">Languages</span>
                                <span className="value">English, Hindi</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3><MapPin size={20} /> Clinic & Hospital</h3>
                        <div className="location-card">
                             <div className="loc-info">
                                <h4>{doctor.hospital?.name || doctor.clinic || 'Main Specialty Clinic'}</h4>
                                <p>{doctor.hospital?.address || '123 Medical Drive, Health City'}</p>
                                <div className="loc-meta">
                                     <span><Clock size={14} /> 9:00 AM - 5:00 PM</span>
                                     <span><MapPin size={14} /> 2.4 km away</span>
                                </div>
                             </div>
                             <div className="loc-map-placeholder">
                                 {/* Map UI mockup */}
                                 <span>Map View</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking Sidebar */}
                <div className="detail-sidebar">
                    <div className="booking-sticky-card">
                        <div className="price-header">
                             <span className="p-label">Consultation Fee</span>
                             <span className="p-value">₹{doctor.fees ?? 500}</span>
                        </div>
                        
                        <div className="next-available">
                            <Clock size={16} />
                            <span>
                                {nextAvailableSlot 
                                    ? `Next availability: ${new Date(nextAvailableSlot.date).toLocaleDateString()} at ${new Date(nextAvailableSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'No slots currently available'}
                            </span>
                        </div>

                        {doctor.slots?.length > 0 && (
                            <div className="slot-picker-container">
                                <h4>Select a Time Slot</h4>
                                <div className="slot-grid-mini">
                                    {doctor.slots.map(slot => (
                                        <button 
                                            key={slot.id}
                                            className={`slot-chip-mini ${selectedSlotId === slot.id ? 'active' : ''}`}
                                            onClick={() => setSelectedSlotId(slot.id)}
                                        >
                                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            className="book-now-full-btn" 
                            disabled={!selectedSlotId || booking}
                            onClick={handleConfirmBooking}
                        >
                            {booking ? 'Processing...' : (selectedSlotId ? 'Confirm Booking' : 'Select a Slot to Book')}
                        </button>

                        <ul className="booking-perks">
                            <li><CheckCircle size={14} /> Instant Confirmation</li>
                            <li><CheckCircle size={14} /> Verified Professional</li>
                            <li><CheckCircle size={14} /> Secure Payment</li>
                        </ul>
                    </div>

                    <div className="sidebar-info-card">
                         <h4>Specializations</h4>
                         <div className="tags-flex">
                            <span className="tag">{doctor.specialty}</span>
                            <span className="tag">General Health</span>
                            <span className="tag">Diagnostics</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircle = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#4caf50'}}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default DoctorDetailPage;
