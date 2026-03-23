import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Heart } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    dob: '1990-01-01',
    gender: 'Male',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : prev.dob,
        gender: user.gender || prev.gender,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // In a real app, save to backend here
    sessionStorage.setItem('user', JSON.stringify({
      ...JSON.parse(sessionStorage.getItem('user') || '{}'),
      ...profileData
    }));
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Personal Profile</h1>
        <p>Manage your account details and medical information</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-avatar-info">
            <h2>{profileData.name}</h2>
            <p className="role-tag">Patient</p>
          </div>
          <button 
            className={`edit-btn ${isEditing ? 'active' : ''}`} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-group">
              <label><User size={16} /> Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={profileData.name} 
                onChange={handleChange} 
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label><Mail size={16} /> Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={profileData.email} 
                onChange={handleChange} 
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={profileData.phone} 
                onChange={handleChange} 
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label><Calendar size={16} /> Date of Birth</label>
              <input 
                type="date" 
                name="dob" 
                value={profileData.dob} 
                onChange={handleChange} 
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label><Heart size={16} /> Gender</label>
              <select 
                name="gender" 
                value={profileData.gender} 
                onChange={handleChange} 
                disabled={!isEditing}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
