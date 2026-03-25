import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Award, Briefcase, DollarSign, MapPin, Building, Globe, Edit, Save, X, CheckCircle, Camera, Loader } from 'lucide-react';
import './ProfilePage.css';

/**
 * ProfilePage Component (Doctor Portal)
 * 
 * A comprehensive professional profile management system.
 * Features:
 * - Multi-section display of Personal, Professional, and Practice details.
 * - Editable fields for qualifications, experience, clinic address, and fees.
 * - Real-time synchronization with the backend and local session state (sessionStorage).
 * - Visual indicators for successful updates and error states.
 */
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/doctors/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.user.name,
          specialty: data.specialty,
          qualifications: data.qualifications || '',
          experience: data.experience || '',
          fees: data.fees || '',
          clinic: data.clinic || '',
          gender: data.gender || '',
          photo: data.photo || ''
        });
      } else {
        setError("Failed to load profile data");
      }
    } catch (err) {
      setError("An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('photo', selectedFile);

      const res = await fetch('/api/doctors/profile/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, photo: data.photoUrl });
        setFormData({ ...formData, photo: data.photoUrl });
        
        // Update sessionStorage
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.doctor) user.doctor.photo = data.photoUrl;
          if (user.patient) user.patient.photo = data.photoUrl; // if applicable
          sessionStorage.setItem('user', JSON.stringify(user));
        }

        setSuccessMsg('Profile photo updated!');
        setSelectedFile(null);
        setPreviewUrl(null);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to upload photo");
      }
    } catch (err) {
      setError("Error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError(null);

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.doctor);
        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
        
        // Update local session storage if name changed
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.name = formData.name;
          if (user.doctor) {
            user.doctor.name = formData.name;
            user.doctor.photo = formData.photo;
          }
          if (user.patient) {
            user.patient.name = formData.name;
          }
          sessionStorage.setItem('user', JSON.stringify(user));
        }

        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container">Loading profile...</div>;
  if (!profile && error) return <div className="error-container">{error}</div>;
  if (!profile) return <div className="error-container">Profile not found</div>;

  const doctorName = isEditing ? formData.name : (profile.user.name.startsWith('Dr.') ? profile.user.name : `Dr. ${profile.user.name}`);

  return (
    <div className="profile-page">
      {successMsg && <div className="success-toast"><CheckCircle size={18} /> {successMsg}</div>}
      {error && <div className="error-toast">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="doctor-profile-header">
          <h1>Doctor Profile</h1>
          <p>Manage your professional details and clinic information</p>
        </div>

        <div className="profile-card hero-card">
          <div className="profile-cover"></div>
          <div className="profile-info-main">
            <div className="avatar-preview-container">
                <div className="profile-avatar-large" onClick={() => !selectedFile && fileInputRef.current.click()}>
                   {previewUrl || profile?.photo ? (
                     <img src={previewUrl || profile.photo} alt={formData.name} className="avatar-img" />
                   ) : (
                     formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'
                   )}
                   {!selectedFile && (
                       <div className="avatar-overlay">
                         {uploading ? <Loader className="spinner" size={24} /> : <Camera size={24} />}
                       </div>
                   )}
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     accept="image/*" 
                     style={{ display: 'none' }} 
                   />
                </div>
                {selectedFile && (
                    <div className="preview-actions">
                        <button type="button" className="confirm-upload-btn" onClick={handleUpload} disabled={uploading}>
                            {uploading ? <Loader className="spinner" size={16} /> : <Save size={16} />}
                            <span>Upload</span>
                        </button>
                        <button type="button" className="cancel-upload-btn" onClick={cancelUpload} disabled={uploading}>
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="profile-name-section">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="edit-name-input"
                  placeholder="Full Name"
                  required
                />
              ) : (
                <h1>{doctorName}</h1>
              )}
              <p className="specialty-tag">
                {profile.specialty}
              </p>
            </div>
            {!isEditing ? (
              <button type="button" className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="edit-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={saving}>
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  <Save size={18} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content-grid">
          {/* Left Column - Core Info */}
          <div className="profile-column main-info">
            <div className="profile-card">
              <h3>Personal Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon"><Mail size={18} /></div>
                  <div className="info-text">
                    <label>Email Address (Read-only)</label>
                    <span className="read-only-field">{profile.user.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Globe size={18} /></div>
                  <div className="info-text">
                    <label>Gender</label>
                    {isEditing ? (
                      <select name="gender" value={formData.gender} onChange={handleChange} className="edit-input">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <span>{profile.gender || "Not specified"}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><User size={18} /></div>
                  <div className="info-text">
                    <label>Photo URL</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="photo"
                        value={formData.photo}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="https://example.com/photo.jpg"
                      />
                    ) : (
                      <span className="photo-url-span">{profile.photo || "No photo uploaded"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h3>Professional Background</h3>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon"><Award size={18} /></div>
                  <div className="info-text">
                    <label>Qualifications</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="e.g. MBBS, MD"
                      />
                    ) : (
                      <span>{profile.qualifications || "Information not available"}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Briefcase size={18} /></div>
                  <div className="info-text">
                    <label>Experience (Years)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="Years of experience"
                      />
                    ) : (
                      <span>{profile.experience ? `${profile.experience} Years` : "Not specified"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Work Info */}
          <div className="profile-column work-info">
            <div className="profile-card highlight-card">
              <h3>Current Affiliation</h3>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon primary-icon"><Building size={20} /></div>
                  <div className="info-text">
                    <label>Assigned Hospital (Read-only)</label>
                    <span className="hospital-name read-only-field">{profile.hospital?.name || "Independent Practice"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h3>Practice Details</h3>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon"><MapPin size={18} /></div>
                  <div className="info-text">
                    <label>Clinic Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="clinic"
                        value={formData.clinic}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="Clinic location"
                      />
                    ) : (
                      <span>{profile.clinic || "Address not set"}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><DollarSign size={18} /></div>
                  <div className="info-text">
                    <label>Consultation Fee ($)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="fees"
                        value={formData.fees}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="e.g. 50"
                      />
                    ) : (
                      <span>{profile.fees ? `$${profile.fees}` : "Free / Not specified"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
