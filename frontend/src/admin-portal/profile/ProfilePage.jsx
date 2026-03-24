import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Heart, Landmark } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@medicare.com',
    phone: '',
    gender: '',
    hospitalName: 'General Hospital'
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
        phone: user.phone || prev.phone || '', 
        gender: user.gender || prev.gender || '', 
        hospitalName: user.hospital ? user.hospital.name : prev.hospitalName
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
    
    // Client-side only save to sessionStorage so update persists AT LEAST on refresh
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    
    sessionStorage.setItem('user', JSON.stringify({
      ...user,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      gender: profileData.gender
    }));
    
    alert("Profile locally updated! (Schema modifications skipped per instruction)");
  };

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your account details and hospital affiliations</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="profile-avatar-info">
            <h2>{profileData.name}</h2>
            <p className="role-tag">Administrator</p>
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
                placeholder="Add phone number"
                value={profileData.phone} 
                onChange={handleChange} 
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label><Heart size={16} /> Gender</label>
              <select 
                name="gender" 
                value={profileData.gender} 
                onChange={handleChange} 
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label><Landmark size={16} /> Hospital Name</label>
              <input 
                type="text" 
                value={profileData.hospitalName} 
                disabled={true}
                className="readonly-input"
              />
              <small className="help-text">Hospital affiliation is managed by system setup assistants.</small>
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
