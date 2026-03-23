import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { loginUser } from '../../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await loginUser(formData.email, formData.password);
      
      // Store token and user data
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      // Verification check against selected form role
      const userRole = data.user.role;
      if (userRole !== role) {
         setError(`This account is registered as ${userRole}. Please use valid credentials or switch tabs.`);
         setLoading(false);
         return;
      }

      alert('Logged in successfully!');
      if (userRole === 'PATIENT') {
        navigate('/patient');
      } else if (userRole === 'DOCTOR') {
        if (data.user.mustChangePassword) {
           navigate('/doctor/change-password');
        } else {
           navigate('/doctor'); 
        }
      } else if (userRole === 'ADMIN') {
        navigate('/admin'); 
      }

    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Brand Header Custom for Login */}
      <div className="login-brand">
        <div className="logo-icon-solid">
          <Activity size={24} color="white" strokeWidth={2.5} />
        </div>
        <span className="logo-text-bold">MediCare</span>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your account to continue</p>

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
            className={role === 'DOCTOR' ? 'active' : ''}
            onClick={() => setRole('DOCTOR')}
          >
            Doctor
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
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label>Password</label>
              <a href="#forgot" className="forgot-password">Forgot password?</a>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      <div className="back-to-home">
        <Link to="/">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>

      <button className="cookie-btn">Manage cookies or opt out</button>
    </div>
  );
};

export default LoginPage;
