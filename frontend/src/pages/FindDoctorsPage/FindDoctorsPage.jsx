import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Activity, ArrowLeft, ChevronDown, Filter, X, Calendar } from 'lucide-react';
import './FindDoctorsPage.css';

/**
 * FindDoctorsPage Component
 * 
 * A public search portal for identifying and researching doctors.
 * Features:
 * - Real-time keyword and name search.
 * - Specialty-based filtering.
 * - Advanced criteria such as gender, fee range, and preferred date.
 * - Public doctor profile access.
 */
const FindDoctorsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize state directly from URL properly to prevent race conditions on mount
  const params = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(params.get('search') || '');
  const [specialtyFilter, setSpecialtyFilter] = useState(params.get('specialty') || '');
  
  const [genderFilter, setGenderFilter] = useState('All');
  const [feeRange, setFeeRange] = useState({ min: '', max: '' });
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchParam = searchParams.get('search');
    const specialtyParam = searchParams.get('specialty');
    
    setSearchTerm(searchParam || '');
    setSpecialtyFilter(specialtyParam || '');
  }, [location.search]);

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specialtyFilter, genderFilter, feeRange, dateFilter, timeFilter]);

  /**
   * Fetches the list of doctors from the backend based on current filters.
   * Handles pagination if applicable and updates the local loading/doctors state.
   */
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specialtyFilter) params.append('specialty', specialtyFilter);
      if (genderFilter !== 'All') params.append('gender', genderFilter);
      if (feeRange.min) params.append('minFee', feeRange.min);
      if (feeRange.max) params.append('maxFee', feeRange.max);
      if (dateFilter) params.append('date', dateFilter);
      if (dateFilter && timeFilter) {
          const fullDateTime = `${dateFilter}T${timeFilter}:00`;
          params.append('startTime', fullDateTime);
      }

      const res = await fetch(`/api/patients/doctors?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logic for the "Book Now" action.
   * Redirects to the login page if the user is not authenticated.
   * Navigates to the patient's booking portal if a session exists.
   * @param {number|string} doctorId - ID of the selected doctor.
   * @param {Object} e - Optional click event for stopPropagation.
   */
  const handleBookNow = (doctorId, e) => {
    e?.stopPropagation();
    const userStr = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!userStr || !token) {
      navigate('/login');
    } else {
      navigate(`/patient/appointments?doctorId=${doctorId}&book=true`);
    }
  };

  const specialtiesMap = {};
  doctors.forEach(d => {
    if (d.specialty) {
      const canonical = d.specialty.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      specialtiesMap[canonical] = true;
    }
  });
  const specialties = Object.keys(specialtiesMap);

  /**
   * Resets all search and filter state variables to their initial values.
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter('');
    setGenderFilter('All');
    setFeeRange({ min: '', max: '' });
    setDateFilter('');
    setTimeFilter('');
  };

  return (
    <div className="find-doctors-container">
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

      <main className="container find-main">
        <div className="page-header">
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link>
          <h1>Find Doctors</h1>
          <p>Browse our extensive network of top healthcare professionals.</p>
        </div>

        <div className="filter-card-find">
          <div className="main-filter-row">
            <div className="search-input-wrapper-find">
              <Search size={20} className="icon" />
              <input 
                type="text" 
                placeholder="Search by doctor name or keyword..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="specialty-select">
              <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                <option value="">All Specialties</option>
                {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
              </select>
            </div>
            <button className={`adv-toggle-find ${showAdvanced ? 'active' : ''}`} onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={14} className={showAdvanced ? 'rotate' : ''} />
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-filters-grid">
               <div className="filter-field">
                  <label>Gender</label>
                  <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                      <option value="All">Any Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                  </select>
               </div>
               <div className="filter-field">
                  <label>Date</label>
                  <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
               </div>
               <div className="filter-field">
                  <label>Time</label>
                  <input type="time" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} />
               </div>
               <div className="filter-field">
                  <label>Consultation Fee</label>
                  <div className="fee-inputs">
                     <input type="number" placeholder="Min" value={feeRange.min} onChange={(e) => setFeeRange({...feeRange, min: e.target.value})} />
                     <span>-</span>
                     <input type="number" placeholder="Max" value={feeRange.max} onChange={(e) => setFeeRange({...feeRange, max: e.target.value})} />
                  </div>
               </div>
               <button className="reset-btn-find" onClick={clearFilters}>
                  <X size={16} /> Reset All
               </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Finding the right doctors for you...</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.length > 0 ? (
              doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card-find" onClick={() => navigate(`/doctors/${doctor.id}`)}>
                  <div className="card-header-find">
                    <div className="avatar-find">
                      {doctor.photo ? <img src={doctor.photo} alt={doctor.name} /> : <span>{doctor.name.charAt(0)}</span>}
                    </div>
                    <div className="basic-info-find">
                      <h3>Dr. {doctor.name}</h3>
                      <span className="spec-badge">{doctor.specialty}</span>
                    </div>
                  </div>
                  
                  <div className="card-details-find">
                    <div className="detail-item-find">
                      <MapPin size={16} />
                      <span>{doctor.hospital?.name || doctor.clinic || 'Medical Center'}</span>
                    </div>
                    <div className="detail-item-find">
                      <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                      <span>{doctor.experience || 5}+ Yrs Exp.</span>
                    </div>
                    <div className="detail-item-find">
                      <Clock size={16} />
                      <span className="availability-text">
                        {doctor.slots?.length > 0 ? 'Next: ' + new Date(doctor.slots[0].startTime).toLocaleDateString() : 'Slots Available'}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer-find">
                    <div className="fee-info">
                      <span className="f-label">Fee</span>
                      <span className="f-amount">₹{doctor.fees || 500}</span>
                    </div>
                    <button onClick={(e) => handleBookNow(doctor.id, e)} className="book-btn-find">
                      <Calendar size={16} />
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Search size={48} color="#9e9e9e" />
                <h3>No doctors found</h3>
                <p>Try broadening your filters or different search terms.</p>
                <button className="btn btn-outline" onClick={clearFilters}>Clear All Filters</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FindDoctorsPage;
