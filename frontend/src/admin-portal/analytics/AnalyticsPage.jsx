import React, { useEffect, useState } from "react";
import { Loader, Users, UserPlus, Calendar, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line } from "recharts";
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

  // Generate last 30 days with zero fill for missing dates
  const appointmentsOverTimeData = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];//convert to YYYY-MM-DD
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = visuals?.appointmentsOverTime?.[dateKey] || 0;
      appointmentsOverTimeData.push({
          date: label,
          Appointments: count
      });
  }

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
                 <LineChart data={appointmentsOverTimeData} width={600} height={300} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                   <defs>
                     <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                       <stop offset="0%" stopColor="#0fb0c2" />
                       <stop offset="100%" stopColor="#3b82f6" />
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="date" 
                     stroke="#94a3b8" 
                     fontSize={12} 
                     tickLine={false}
                     axisLine={false}
                     dy={10}
                   />
                   <YAxis 
                     stroke="#94a3b8" 
                     fontSize={12} 
                     tickLine={false}
                     axisLine={false}
                     dx={-10}
                   />
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="Appointments" 
                     stroke="url(#lineGradient)" 
                     strokeWidth={4} 
                     dot={{ fill: '#0fb0c2', strokeWidth: 2, r: 4, stroke: '#fff' }}
                     activeDot={{ r: 6, strokeWidth: 0 }}
                   />
                 </LineChart>
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
                  <BarChart data={visuals.mostBookedSpecialty} width={300} height={260} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="specGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      fontSize={10} 
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      fontSize={12} 
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" name="Appointments" fill="url(#specGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
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
                 <BarChart data={visuals.mostBookedDoctor} width={300} height={260} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                   <defs>
                     <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#4ade80" />
                       <stop offset="100%" stopColor="#22c55e" />
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="label" 
                     fontSize={10} 
                     tick={{ fill: '#94a3b8' }}
                     axisLine={false}
                     tickLine={false}
                   />
                   <YAxis 
                     allowDecimals={false} 
                     fontSize={12} 
                     tick={{ fill: '#94a3b8' }}
                     axisLine={false}
                     tickLine={false}
                   />
                   <Tooltip 
                     cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   />
                   <Bar dataKey="value" name="Appointments" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                 </BarChart>
            ) : <div className="no-data">No data available</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
