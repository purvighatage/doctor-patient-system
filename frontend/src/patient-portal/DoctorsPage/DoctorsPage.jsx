import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Star, Clock, MapPin, Calendar } from 'lucide-react';
import './DoctorsPage.css';

const DoctorsPage = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('All');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('/api/patients/doctors');
                if (response.ok) {
                    const data = await response.json();
                    setDoctors(data);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const specialties = ['All', ...new Set(doctors.map(d => {
        const s = d.specialty || '';
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }))];

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (doctor.specialty || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = specialtyFilter === 'All' || 
                                (doctor.specialty || '').toLowerCase() === specialtyFilter.toLowerCase();
        return matchesSearch && matchesSpecialty;
    });

    const handleBookAppointment = (doctorId) => {
        navigate(`/patient/appointments?book=true&doctorId=${doctorId}`);
    };

    return (
        <div className="doctors-page-container">
            <header className="page-header">
                <div className="header-content">
                    <h1>Find Your Doctor</h1>
                    <p>Book appointments with the best specialists in the city</p>
                </div>
            </header>

            <div className="filters-section">
                <div className="search-bar">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name or specialty..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="specialty-filter">
                    {specialties.map(specialty => (
                        <button 
                            key={specialty} 
                            className={`filter-btn ${specialtyFilter === specialty ? 'active' : ''}`}
                            onClick={() => setSpecialtyFilter(specialty)}
                        >
                            {specialty}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching amazing doctors for you...</p>
                </div>
            ) : (
                <div className="doctors-grid">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doctor => (
                            <div key={doctor.id} className="doctor-card">
                                <div className="card-top">
                                    <div className="doctor-avatar">
                                        {doctor.photo ? (
                                            <img src={doctor.photo} alt={doctor.name} />
                                        ) : (
                                            <User size={40} />
                                        )}
                                    </div>
                                    <div className="doctor-rating">
                                        <Star size={14} fill="#FFD700" color="#FFD700" />
                                        <span>4.8</span>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3 className="doctor-name">Dr. {doctor.name}</h3>
                                    <p className="doctor-specialty">{doctor.specialty}</p>
                                    
                                    <div className="doctor-meta">
                                        <div className="meta-item">
                                            <Clock size={16} />
                                            <span>{doctor.experience || 5}+ Years Exp.</span>
                                        </div>
                                        <div className="meta-item">
                                            <MapPin size={16} />
                                            <span>{doctor.clinic || 'General Clinic'}</span>
                                        </div>
                                    </div>

                                    <div className="price-tag">
                                        <span className="label">Consultation Fee</span>
                                        <span className="value">₹{doctor.fees || 500}</span>
                                    </div>

                                    <button 
                                        className="doctor-card-book-btn"
                                        onClick={() => handleBookAppointment(doctor.id)}
                                    >
                                        <Calendar size={18} />
                                        <span>Book Appointment</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <h3>No doctors found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
