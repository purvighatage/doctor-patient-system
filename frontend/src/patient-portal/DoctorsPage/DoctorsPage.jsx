import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Star, Clock, MapPin, Calendar, Filter, ChevronDown, X } from 'lucide-react';
import './DoctorsPage.css';

/**
 * DoctorsPage Component
 * 
 * Provides a searchable, filterable directory of available doctors for authenticated patients.
 * Features:
 * - Real-time filtering by name/keyword.
 * - Dropdown for specialty selection.
 * - Expandable "Advanced Filters" for gender, date of availability, and fee ranges.
 * - Interactive doctor cards with professional summaries and booking entry points.
 */
const DoctorsPage = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');
    const [feeRange, setFeeRange] = useState({ min: '', max: '' });
    const [dateFilter, setDateFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, [searchTerm, specialtyFilter, genderFilter, feeRange, dateFilter, timeFilter]);

    /**
     * Fetches doctor data from the API based on current search and filter states.
     * Updates 'doctors' state with the results for grid rendering.
     */
    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (specialtyFilter !== 'All') params.append('specialty', specialtyFilter);
            if (genderFilter !== 'All') params.append('gender', genderFilter);
            if (feeRange.min) params.append('minFee', feeRange.min);
            if (feeRange.max) params.append('maxFee', feeRange.max);
            if (dateFilter) params.append('date', dateFilter);
            if (dateFilter && timeFilter) {
                // Combine date and time into ISO
                const fullDateTime = `${dateFilter}T${timeFilter}:00`;
                params.append('startTime', fullDateTime);
            }

            const response = await fetch(`/api/patients/doctors?${params.toString()}`);
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

    // Derived list of specialties from initial fetch or common list
    const [allSpecialties, setAllSpecialties] = useState(['All']);
    useEffect(() => {
        if (doctors.length > 0 && allSpecialties.length === 1) {
            const uniqueMap = { 'All': true };
            doctors.forEach(d => {
                if (d.specialty) {
                    const canonical = d.specialty.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    uniqueMap[canonical] = true;
                }
            });
            setAllSpecialties(Object.keys(uniqueMap));
        }
    }, [doctors]);

    /**
     * Resets all search terms and filtering criteria to their initial state.
     */
    const clearFilters = () => {
        setSearchTerm('');
        setSpecialtyFilter('All');
        setGenderFilter('All');
        setFeeRange({ min: '', max: '' });
        setDateFilter('');
        setTimeFilter('');
    };

    return (
        <div className="doctors-page-container">
            <header className="page-header">
                <div className="header-content">
                    <h1>Find Your Doctor</h1>
                    <p>Book appointments with the best specialists in the city</p>
                </div>
            </header>

            <div className="filter-card">
                <div className="main-search-row">
                    <div className="search-box">
                        <Search size={20} className="icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name or keyword..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                            {allSpecialties.map(s => <option key={s} value={s}>{s} Specialty</option>)}
                        </select>
                    </div>
                    <button className={`adv-toggle ${showAdvanced ? 'active' : ''}`} onClick={() => setShowAdvanced(!showAdvanced)}>
                        <Filter size={18} />
                        <span>Filters</span>
                        <ChevronDown size={14} className={showAdvanced ? 'rotate' : ''} />
                    </button>
                </div>

                {showAdvanced && (
                    <div className="advanced-filters-row">
                        <div className="adv-field">
                            <label>Gender</label>
                            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                                <option value="All">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="adv-field">
                            <label>Preferred Date</label>
                            <input 
                                type="date" 
                                value={dateFilter} 
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDateFilter(e.target.value)} 
                            />
                        </div>
                        <div className="adv-field">
                            <label>Preferred Time</label>
                            <input 
                                type="time" 
                                value={timeFilter} 
                                onChange={(e) => setTimeFilter(e.target.value)} 
                            />
                        </div>
                        <div className="adv-field">
                            <label>Fee Range (₹)</label>
                            <div className="range-inputs">
                                <input type="number" placeholder="Min" value={feeRange.min} onChange={(e) => setFeeRange({...feeRange, min: e.target.value})} />
                                <span>-</span>
                                <input type="number" placeholder="Max" value={feeRange.max} onChange={(e) => setFeeRange({...feeRange, max: e.target.value})} />
                            </div>
                        </div>
                        <button className="clear-btn" onClick={clearFilters}>
                            <X size={16} />
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Matching you with the best doctors...</p>
                </div>
            ) : (
                <div className="doctors-grid">
                    {doctors.length > 0 ? (
                        doctors.map(doctor => (
                            <div key={doctor.id} className="doctor-card" onClick={() => navigate(`/patient/doctors/${doctor.id}`)}>
                                <div className="card-top">
                                    <div className="doctor-avatar">
                                        {doctor.photo ? <img src={doctor.photo} alt={doctor.name} /> : <User size={40} />}
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
                                            <span>{doctor.hospital?.name || doctor.clinic || 'Main Clinic'}</span>
                                        </div>
                                    </div>

                                    <div className="price-tag">
                                        <span className="label">Consultation Fee</span>
                                        <span className="value">₹{doctor.fees || 500}</span>
                                    </div>

                                    <button 
                                        className="doctor-card-book-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/patient/appointments?book=true&doctorId=${doctor.id}`);
                                        }}
                                    >
                                        <Calendar size={18} />
                                        <span>Book Now</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <h3>No doctors match your criteria</h3>
                            <p>Try broadening your search or resetting the filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
