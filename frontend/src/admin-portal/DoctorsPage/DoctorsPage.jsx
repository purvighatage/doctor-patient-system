import React, { useEffect, useState } from "react";
import { Search, Plus, UserRound, Mail, Calendar, ToggleLeft, ToggleRight, Loader, X, CheckCircle } from "lucide-react";
import "./DoctorsPage.css";

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  // Modal & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    qualifications: "",
    experience: "",
    fees: "",
    clinic: "",
    gender: "MALE",
    photo: ""
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/api/admins/doctors", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`/api/admins/doctors/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ active: !currentStatus })
      });

      if (response.ok) {
        setDoctors(prev => prev.map(doc => 
          doc.id === id ? { ...doc, active: !currentStatus } : doc
        ));
      } else {
         console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling doctor status:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.name || !formData.email || !formData.specialty) {
      setError("Name, Email, and Specialty are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/api/admins/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData({
          name: formData.name,
          tempPassword: data.tempPassword
        });
        fetchDoctors(); // Refresh list
        setFormData({
             name: "", email: "", specialty: "", qualifications: "",
             experience: "", fees: "", clinic: "", gender: "MALE", photo: ""
        });
      } else {
        setError(data.message || "Failed to create doctor");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doctors-container">
      <div className="doctors-header">
        <div>
           <h1 className="page-title">Doctors</h1>
           <p className="page-subtitle">Manage all medical personnel and schedules</p>
        </div>
        <button className="add-doctor-btn" onClick={() => setShowAddModal(true)}>
             <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div className="doctors-toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or specialty..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
             <Loader className="spinner" size={40} />
             <span>Loading doctors list...</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Qualifications</th>
                <th>Experience</th>
                <th>Fees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-info">
                        <div className="doc-avatar">
                          <img src={doc.photo || "/uploads/default-doctor.png"} alt={doc.name} />
                        </div>
                        <div>
                          <div className="doc-name">{doc.name}</div>
                          <div className="doc-email">
                            <Mail size={12} /> {doc.user?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{doc.specialty}</td>
                    <td>{doc.qualifications || "N/A"}</td>
                    <td>{doc.experience ? `${doc.experience} Years` : "N/A"}</td>
                    <td>${doc.fees ? doc.fees : "0"}</td>
                    <td>
                      <span className={`status-badge ${doc.active ? "active" : "inactive"}`}>
                        {doc.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`action-btn-status ${doc.active ? "status-active" : "status-inactive"}`}
                        onClick={() => toggleStatus(doc.id, doc.active)}
                        disabled={togglingId === doc.id}
                      >
                        {togglingId === doc.id ? <Loader className="spinner" size={14} /> : (
                            doc.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />
                        )}
                        <span>{doc.active ? "Deactivate" : "Activate"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-row">No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{successData ? "Doctor Created Successfully" : "Add New Doctor"}</h3>
              <button className="close-btn" onClick={() => { setShowAddModal(false); setSuccessData(null); setError(""); }}>
                <X size={20} />
              </button>
            </div>

            {successData ? (
              <div className="success-dialog">
                <div className="success-icon"><CheckCircle size={48} /></div>
                <p>Doctor <strong>{successData.name}</strong> has been created.</p>
                <div className="pass-box">
                  <span>Temporary Password:</span>
                  <div className="temp-password">{successData.tempPassword}</div>
                </div>
                <p className="pass-note">Please share this password with the doctor so they can log in.</p>
                <button className="done-btn" onClick={() => { setShowAddModal(false); setSuccessData(null); }}>Done</button>
              </div>
            ) : (
              <form className="add-doctor-form" onSubmit={handleSubmit}>
                {error && <div className="form-error">{error}</div>}
                
                <div className="form-grid">
                  <div className="input-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="input-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>

                  <div className="input-group">
                    <label>Specialty *</label>
                    <input type="text" name="specialty" value={formData.specialty} placeholder="e.g. Cardiology" onChange={handleInputChange} required />
                  </div>

                  <div className="input-group">
                    <label>Qualifications</label>
                    <input type="text" name="qualifications" value={formData.qualifications} placeholder="e.g. MBBS, MD" onChange={handleInputChange} />
                  </div>

                  <div className="input-group">
                    <label>Experience (Years)</label>
                    <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} min="0" />
                  </div>

                  <div className="input-group">
                    <label>Consultation Fees ($)</label>
                    <input type="number" name="fees" value={formData.fees} onChange={handleInputChange} min="0" />
                  </div>

                  <div className="input-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Clinic Location</label>
                    <input type="text" name="clinic" value={formData.clinic} onChange={handleInputChange} />
                  </div>
                  
                  <div className="input-group full-width">
                    <label>Photo URL</label>
                    <input type="text" name="photo" value={formData.photo} placeholder="https://example.com/photo.jpg" onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="spinner" size={16} /> : "Create Doctor"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsPage;
