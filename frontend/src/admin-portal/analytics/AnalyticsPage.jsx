import React, { useEffect, useState } from "react";
import { Loader, Users, UserPlus, Calendar, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import "./AnalyticsPage.css";

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/api/admins/analytics", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="spinner" size={40} />
        <span>Loading Analytics...</span>
      </div>
    );
  }

  if (!data) return <div className="error-state">Failed to load analytics data</div>;

  const { metrics, visuals } = data;

  // Format appointmentsOverTime object for AreaChart
  const appointmentsOverTimeData = visuals?.appointmentsOverTime
    ? Object.entries(visuals.appointmentsOverTime).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Appointments: count
      })).sort((a,b) => new Date(a.date) - new Date(b.date))
    : [];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
         <h1 className="page-title">Analytics</h1>
         <p className="page-subtitle">Visual overview of hospital performance and trends</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue"><Users size={24} /></div>
          <div className="metric-content">
               <span className="metric-label">Total Patients</span>
               <h3 className="metric-value">{metrics.totalPatients || 0}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon green"><UserPlus size={24} /></div>
          <div className="metric-content">
               <span className="metric-label">Active Doctors</span>
               <h3 className="metric-value">{metrics.activeDoctors || 0}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orange"><Calendar size={24} /></div>
          <div className="metric-content">
               <span className="metric-label">Total Appointments</span>
               <h3 className="metric-value">{metrics.totalAppointments || 0}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon red"><AlertTriangle size={24} /></div>
          <div className="metric-content">
               <span className="metric-label">Cancellation Rate</span>
               <h3 className="metric-value">{metrics.cancellationRate || "0%"}</h3>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="charts-grid">
        {/* Appointments Over Time */}
        <div className="chart-wrapper full-width">
          <div className="chart-header">
            <h4>Appointments Trend (Last 30 Days)</h4>
          </div>
          <div className="chart-body">
            {appointmentsOverTimeData.length > 0 ? (
               <ResponsiveContainer width="100%" height={300}>
                 <AreaChart data={appointmentsOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#0fb0c2" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#0fb0c2" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                   <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                   <YAxis stroke="#94a3b8" fontSize={12} />
                   <Tooltip />
                   <Area type="monotone" dataKey="Appointments" stroke="#0fb0c2" fillOpacity={1} fill="url(#colorApps)" />
                 </AreaChart>
               </ResponsiveContainer>
            ) : <div className="no-data">No sufficient date data</div>}
          </div>
        </div>

        {/* Most Booked Specialty (Pie Chart) */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h4>Appointments by Specialty</h4>
          </div>
          <div className="chart-body">
            {visuals?.mostBookedSpecialty?.length > 0 ? (
               <ResponsiveContainer width="100%" height={260}>
                 <PieChart>
                   <Pie
                     data={visuals.mostBookedSpecialty}
                     dataKey="value"
                     nameKey="label"
                     cx="50%" cy="50%"
                     outerRadius={80}
                     fill="#8884d8"
                     label={({ label }) => label}
                   >
                     {visuals.mostBookedSpecialty.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
            ) : <div className="no-data">No data available</div>}
          </div>
        </div>

        {/* Most Booked Doctor (Bar Chart) */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h4>Top Booked Doctors</h4>
          </div>
          <div className="chart-body">
            {visuals?.mostBookedDoctor?.length > 0 ? (
               <ResponsiveContainer width="100%" height={260}>
                 <BarChart data={visuals.mostBookedDoctor} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                   <XAxis dataKey="label" opacity={0} />
                   <YAxis allowDecimals={false} />
                   <Tooltip />
                   <Bar dataKey="value" name="Appointments" fill="#4ade80" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            ) : <div className="no-data">No data available</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
