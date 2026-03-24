import React, { useEffect, useState } from "react";
import { Loader, Users, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import "./AnalyticsPage.css";

/**
 * AnalyticsPage Component (Doctor Portal)
 * 
 * A data visualization dashboard for professional performance tracking.
 * Includes:
 * - High-level metrics for totals (Patients, Visits, Bookings) and efficiency (Cancellation Rate).
 * - "Appointments Trend" area chart for longitudinal volume tracking.
 * - "Appointment Status" pie chart for operational health assessment.
 */
function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/api/doctors/analytics", {
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

  const COLORS = ["#00bcd4", "#4caf50", "#ff9800", "#f44336", "#9c27b0"];

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="spinner" size={40} />
        <span>Loading Your Analytics...</span>
      </div>
    );
  }

  if (!data) return <div className="error-state">Failed to load analytics data</div>;

  const { metrics, visuals } = data;

  // Format appointmentsOverTime for AreaChart
  const appointmentsOverTimeData = visuals?.appointmentsOverTime
    ? Object.entries(visuals.appointmentsOverTime)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Appointments: count
      }))
    : [];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track your performance, appointments, and patient metrics</p>
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
          <div className="metric-icon green"><CheckCircle size={24} /></div>
          <div className="metric-content">
            <span className="metric-label">Completed Visits</span>
            <h3 className="metric-value">{metrics.completedAppointments || 0}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orange"><Calendar size={24} /></div>
          <div className="metric-content">
            <span className="metric-label">Total Bookings</span>
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
        {/* Appointments Trend */}
        <div className="chart-wrapper full-width">
          <div className="chart-header">
            <h4>Appointments Trend (Last 30 Days)</h4>
          </div>
          <div className="chart-body">
            {appointmentsOverTimeData.length > 0 ? (
                 <AreaChart data={appointmentsOverTimeData} width={600} height={300} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0fb0c2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0fb0c2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Appointments"
                    stroke="#0fb0c2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAppts)"
                  />
                 </AreaChart>
            ) : (
              <div className="no-data-placeholder">
                <Calendar size={48} opacity={0.2} />
                <p>No appointment data found for the last 30 days</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Status Distribution (Pie Chart) */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h4>Appointment Status</h4>
          </div>
          <div className="chart-body">
            {visuals?.statusDistribution?.length > 0 ? (
                 <PieChart width={300} height={260}>
                  <Pie
                    data={visuals.statusDistribution}
                    dataKey="value"
                    nameKey="label"
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {visuals.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
            ) : <div className="no-data-placeholder"><p>No status data available</p></div>}
          </div>
        </div>

        {/* Placeholder for future growth chart */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h4>Performance Overview</h4>
          </div>
          <div className="performance-placeholder">
            <div className="stat-card-mini">
              <label>Efficiency</label>
              <h3>94%</h3>
            </div>
            <div className="stat-card-mini">
              <label>Patient Satisfaction</label>
              <h3>4.8/5.0</h3>
            </div>
            <p className="note">Keep up the great work! Your patient retention is up by 12% this month.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
