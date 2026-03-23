import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/doctors/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        // Update user mustChangePassword flag locally
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.mustChangePassword = false;
          sessionStorage.setItem('user', JSON.stringify(user));
        }
        alert("Password updated successfully! Redirecting to dashboard...");
        setTimeout(() => navigate('/doctor/dashboard'), 2000);
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-pwd-container">
      <div className="change-pwd-card">
        <h2>Change Temporary Password</h2>
        <p className="subtitle">You are using a temporary password. Please create a new secure password to continue.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Password updated successfully!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current/Temporary Password</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Enter current password"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter at least 6 characters"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading || success}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
