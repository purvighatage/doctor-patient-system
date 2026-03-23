import React, { useEffect, useState } from "react";
import { Search, Users, Mail, Phone, Calendar, Loader, User } from "lucide-react";
import "./PatientsPage.css";

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(pat => 
      pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pat.phone && pat.phone.includes(searchTerm)) ||
      (pat.email && pat.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/api/admins/patients", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patients-container">
      <div className="patients-header">
        <div>
           <h1 className="page-title">Patients</h1>
           <p className="page-subtitle">View all patients treated under your hospital</p>
        </div>
      </div>

      <div className="patients-toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
             <Loader className="spinner" size={40} />
             <span>Loading patients list...</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact info</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Treating Doctor(s)</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <div className="patient-info">
                        <div className="pat-avatar">
                          <User size={18} />
                        </div>
                        <div className="pat-name">{pat.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-details">
                        <div className="contact-item"><Mail size={12} /> {pat.email}</div>
                        {pat.phone && <div className="contact-item"><Phone size={12} /> {pat.phone}</div>}
                      </div>
                    </td>
                    <td><span className="gender-tag">{pat.gender || "N/A"}</span></td>
                    <td>{pat.dob ? new Date(pat.dob).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <div className="doctors-tags">
                        {pat.treatingDoctors && pat.treatingDoctors.length > 0 ? (
                          pat.treatingDoctors.map((doc, idx) => (
                            <span key={idx} className="doc-tag">{doc}</span>
                          ))
                        ) : (
                          <span className="no-doc">No assigned details</span>
                        )}
                      </div>
                    </td>
                    <td>{pat.user?.createdAt ? new Date(pat.user.createdAt).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-row">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientsPage;
