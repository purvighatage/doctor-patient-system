import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { registerPatient, registerAdmin } from '../../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('PATIENT'); // 'PATIENT' or 'ADMIN'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    hospitalName: '',
    hospitalAddress: '',
    password: '',
    confirmPassword: ''
  });

  // Keep dark mode check if needed, or rely on global class
  useEffect(() => {
    // If the dark mode state is kept globally via body class, nothing needed here
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      if (role === 'PATIENT') {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          password: formData.password
        };
        await registerPatient(payload);
      } else {
        const payload = {
          adminName: formData.name,
          email: formData.email,
          password: formData.password,
          hospitalName: formData.hospitalName,
          address: formData.hospitalAddress,
          phone: formData.phone
        };
        await registerAdmin(payload);
      }
      
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Brand Header */}
      <div className="register-header">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <span className="logo-text">MediCare</span>
        </Link>
      </div>

      {/* Register Card */}
      <div className="register-card">
        <h2>Create an account</h2>
        <p className="subtitle">Enter your information to get started</p>

        {error && <div className="error-message">{error}</div>}

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={role === 'PATIENT' ? 'active' : ''}
            onClick={() => setRole('PATIENT')}
          >
            Patient
          </button>
          <button
            type="button"
            className={role === 'ADMIN' ? 'active' : ''}
            onClick={() => setRole('ADMIN')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'PATIENT' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (234) 567-8900"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <div className="form-group">
                <label>Admin Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="jane@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hospital Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  placeholder="City General Hospital"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hospital Address</label>
                <input
                  type="text"
                  name="hospitalAddress"
                  placeholder="123 Health Ave, NY"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hospital Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (800) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <button className="cookie-btn">Manage cookies or opt out</button>
    </div>
  );
};

export default RegisterPage;
