import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Activity, ArrowLeft, ChevronDown } from 'lucide-react';
import './FindDoctorsPage.css';

const FindDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const specialtyParam = params.get('specialty');
    
    if (searchParam) setSearchTerm(searchParam);
    if (specialtyParam) setSpecialtyFilter(specialtyParam);
  }, [location.search]);

  // We assume backend runs on 3000 or the same host. Adjust port if backend is on 5000.
  const API_BASE = '/api'; 

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specialtyFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specialtyFilter) params.append('specialty', specialtyFilter);

      const res = await fetch(`${API_BASE}/patients/doctors?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (doctorId) => {
    const userStr = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!userStr || !token) {
      navigate('/login');
    } else {
      navigate(`/patient/appointments?doctorId=${doctorId}&book=true`);
    }
  };

  // Derive unique specialties for the filter dropdown (Case-Insensitive)
  const specialtiesMap = {};
  doctors.forEach(d => {
    if (d.specialty) {
      const canonical = d.specialty.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      specialtiesMap[canonical] = true;
    }
  });
  const specialties = Object.keys(specialtiesMap);

  return (
    <div className="find-doctors-container">
      {/* Header */}
      <header className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">MediCare</span>
          </Link>
          <nav className="nav-links">
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container find-main">
        <div className="page-header">
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link>
          <h1>Find Doctors</h1>
          <p>Browse our extensive network of top healthcare professionals.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Search by doctor name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <Search size={18} className="filter-icon" />
            <select 
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All Specialties</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
              {/* Fallback hardcoded if list is empty */}
              {specialties.length === 0 && (
                <>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                </>
              )}
            </select>
            <ChevronDown size={18} className="chevron-icon" />
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading doctors...</p>
          </div>
        ) : doctors.length > 0 ? (
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-card-header">
                  <div className="doctor-avatar">
                    {doctor.photo ? (
                      <img src={doctor.photo} alt={doctor.name} />
                    ) : (
                      <span>{doctor.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="doctor-info-basic">
                    <h3>Dr. {doctor.name}</h3>
                    <span className="specialty-badge">{doctor.specialty}</span>
                  </div>
                </div>
                
                <div className="doctor-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{doctor.hospital ? doctor.hospital.name : doctor.clinic || 'General Practice'}</span>
                  </div>
                  <div className="detail-item">
                    <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                    <span>{doctor.experience || 5}+ Years Experience</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>Next available slot: {doctor.slots && doctor.slots.length > 0 ? new Date(doctor.slots[0].startTime).toLocaleDateString() : 'Contact for availability'}</span>
                  </div>
                </div>

                <div className="doctor-footer">
                  <div className="fees">
                    <span className="fee-label">Consultation Fee</span>
                    <span className="fee-amount">${doctor.fees || 150}</span>
                  </div>
                  <button onClick={() => handleBookNow(doctor.id)} className="btn btn-primary">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} color="var(--text-light)" />
            <h3>No doctors found</h3>
            <p>Try adjusting your search filters to find what you're looking for.</p>
            <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setSpecialtyFilter(''); }}>
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FindDoctorsPage;
