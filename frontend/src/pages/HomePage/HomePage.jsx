import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun, ArrowRight, Calendar, Video, Shield, Users, Star, CheckCircle, Search } from 'lucide-react';
import './HomePage.css';


const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);


  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  return (
    <>
      {/* Header Section */}
      <header className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <div className="logo-icon">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">MediCare</span>
          </div>

          <nav className="nav-links">
            <Link to="/find" className="nav-link">Find Doctors</Link>
            <button className="icon-btn dark-mode-toggle" aria-label="Toggle Dark Mode" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          {/* Hero Content */}
          <div className="hero-content">
            <div className="badge">
              <span className="badge-text">Trusted by 50,000+ patients</span>
            </div>

            <h1 className="hero-title">
              Your Health,<br />
              <span className="highlight">Our Priority</span>
            </h1>

            <p className="hero-subtitle">
              Connect with top healthcare professionals, manage appointments, and access your medical records - all in one secure platform.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) {
                alert('Please enter a doctor name or specialty to search.');
                return;
              }
              navigate(`/find?search=${encodeURIComponent(searchQuery.trim())}`);
            }} className="hero-search-bar">
              <div className="search-input-wrapper">
                <Search size={20} className="home-search-icon" />
                <input
                  type="text"
                  placeholder="Search doctor, specialties (e.g. Cardiologist)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="hero-cta">
              <Link to="/login" className="btn btn-primary btn-lg">
                Book Appointment
                <ArrowRight size={16} className="arrow-icon" />
              </Link>
              <Link to="/find" className="btn btn-secondary btn-lg">Find Doctors</Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-item">
                <h3>50K+</h3>
                <p>Patients</p>
              </div>
              <div className="stat-item">
                <h3>1,200+</h3>
                <p>Doctors</p>
              </div>
              <div className="stat-item">
                <h3>4.9/5</h3>
                <p>Rating</p>
              </div>
              <div className="stat-item">
                <h3>100K+</h3>
                <p>Appointments</p>
              </div>
            </div>
          </div>

          {/* Hero Feature Cards */}
          <div className="hero-cards">
            <div className="feature-card offset-up">
              <div className="icon-wrapper blue">
                <Calendar size={24} />
              </div>
              <h4>Easy Booking</h4>
              <p>Schedule in minutes</p>
            </div>

            <div className="feature-card">
              <div className="icon-wrapper green">
                <Video size={24} />
              </div>
              <h4>Video Calls</h4>
              <p>Consult from home</p>
            </div>

            <div className="feature-card offset-up">
              <div className="icon-wrapper purple">
                <Shield size={24} />
              </div>
              <h4>Secure Data</h4>
              <p>HIPAA compliant</p>
            </div>

            <div className="feature-card">
              <div className="icon-wrapper orange">
                <Users size={24} />
              </div>
              <h4>Top Doctors</h4>
              <p>1,200+ specialists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose MediCare?</h2>
            <p>Everything you need for comprehensive healthcare management</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="icon-wrapper blue">
                <Calendar size={24} />
              </div>
              <h3>Easy Appointment Booking</h3>
              <p>Schedule consultations with top doctors in just a few clicks</p>
            </div>
            <div className="benefit-card">
              <div className="icon-wrapper green">
                <Video size={24} />
              </div>
              <h3>Video Consultations</h3>
              <p>Connect with doctors remotely through secure video calls</p>
            </div>
            <div className="benefit-card">
              <div className="icon-wrapper purple">
                <Shield size={24} />
              </div>
              <h3>Secure & Private</h3>
              <p>Your medical records are encrypted and HIPAA compliant</p>
            </div>
            <div className="benefit-card">
              <div className="icon-wrapper orange">
                <CheckCircle size={24} />
              </div>
              <h3>24/7 Access</h3>
              <p>Access your health records and medications anytime, anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Patients Say</h2>
            <p>Trusted by thousands of satisfied patients</p>
          </div>

          <div className="testimonials-grid">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="quote">"MediCare has made managing my health so much easier. The doctors are professional and caring."</p>
              <div className="author">
                <h4>Sarah Johnson</h4>
                <span>Patient</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="quote">"Video consultations saved me so much time. The platform is intuitive and secure."</p>
              <div className="author">
                <h4>Michael Chen</h4>
                <span>Patient</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="quote">"Best healthcare platform I've used. Booking appointments is simple and quick."</p>
              <div className="author">
                <h4>Emily Davis</h4>
                <span>Patient</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients managing their health with MediCare</p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-outline-light">
              Create Account
              <ArrowRight size={16} className="arrow-icon" style={{ marginLeft: 8 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <span className="logo-text">MediCare</span>
              </div>
              <p className="footer-desc">Your trusted healthcare management platform</p>
            </div>

            <div className="footer-links">
              <h4>Product</h4>
              <ul>
                <li><Link to="/find">Find Doctors</Link></li>
                <li><Link to="/login">Book Appointment</Link></li>
                <li><Link to="/login">Patient Portal</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#hipaa">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>



    </>
  );
};

export default HomePage;
