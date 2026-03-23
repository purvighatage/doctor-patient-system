import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserRound, CalendarHeart, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from "recharts";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
      totalPatients: 1248, // Fallback mockup defaults
      totalDoctors: 45,
      todayAppointments: 124,
      monthlyRevenue: 45600
  });

  const [overview, setOverview] = useState({
      activeUsers: 892,
      pendingApprovals: 8,
      systemHealth: "All Systems Operational"
  });

  const [trends, setTrends] = useState({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      patients: [120, 135, 142, 160, 175, 195],
      revenue: [25000, 28000, 31000, 36000, 41000, 45600]
  });

  const [specializationData, setSpecializationData] = useState([
      { name: "Cardiology", value: 36, color: "#0d9488" },
      { name: "Pediatrics", value: 30, color: "#06b6d4" },
      { name: "Dermatology", value: 18, color: "#22d3ee" },
      { name: "Orthopedics", value: 16, color: "#67e8f9" }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
       const fetchData = async () => {
           setLoading(true);
           const token = sessionStorage.getItem("token");
           const API_BASE = "/api/adminportal/dashboard";
           try {
                const statsRes = await fetch(`${API_BASE}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsRes.ok) {
                     const data = await statsRes.json();
                     setStats(data.stats);
                     setOverview(data.overview);
                }

                const trendsRes = await fetch(`${API_BASE}/growth-trends`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (trendsRes.ok) {
                     const data = await trendsRes.json();
                     setTrends(data);
                }

                const specRes = await fetch(`${API_BASE}/specialization`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (specRes.ok) {
                     const data = await specRes.json();
                     // Map to chart format
                     const colors = ["#0d9488", "#06b6d4", "#22d3ee", "#67e8f9", "#14b8a6"];
                     const formatted = data.labels.map((label, index) => ({
                          name: label,
                          value: data.values[index],
                          color: colors[index % colors.length]
                     }));
                     setSpecializationData(formatted);
                }
           } catch (error) {
                console.error("Error fetching dashboard data:", error);
           } finally {
                setLoading(false);
           }
       };

       fetchData();

       const intervalId = setInterval(fetchData, 30000); // Poll every 30s
       return () => clearInterval(intervalId);
  }, []);

  // Format data for Recharts AreaChart
  const chartData = trends.labels.map((label, index) => ({
       name: label,
       Patients: trends.patients[index],
       Revenue: trends.revenue[index]
  }));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dash-title">Admin Dashboard</h1>
        <p className="dash-subtitle">Overview of system performance and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
             icon={<UserRound size={24} />} 
             label="Total Patients" 
             value={stats.totalPatients.toLocaleString()} 
             growth="+12.5%" 
             color="blue"
        />
        <StatCard 
             icon={<Users size={24} />} 
             label="Total Doctors" 
             value={stats.totalDoctors} 
             growth="+5.2%" 
             color="green"
        />
        <StatCard 
             icon={<CalendarHeart size={24} />} 
             label="Today's Appointments" 
             value={stats.todayAppointments} 
             growth="+18%" 
             color="purple"
        />
        <StatCard 
             icon={<DollarSign size={24} />} 
             label="Monthly Revenue" 
             value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`} 
             growth="+23%" 
             color="teal"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Line Chart / Area Chart */}
        <div className="chart-card">
             <div className="card-header">
                  <h3>Growth Trends</h3>
                  <span className="card-subtitle">Monthly patients and revenue</span>
             </div>
             <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                       <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                 <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0492c2" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#0492c2" stopOpacity={0}/>
                                 </linearGradient>
                                 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                 </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Patients" stroke="#0492c2" fillOpacity={1} fill="url(#colorPatients)" />
                            <Area type="monotone" dataKey="Revenue" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRevenue)" />
                       </AreaChart>
                  </ResponsiveContainer>
             </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
             <div className="card-header">
                  <h3>Appointments by Specialization</h3>
                  <span className="card-subtitle">Distribution of medical consultations</span>
             </div>
             <div className="chart-wrapper pie-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                       <PieChart>
                            <Pie 
                                 data={specializationData} 
                                 innerRadius={60} 
                                 outerRadius={90} 
                                 fill="#8884d8" 
                                 paddingAngle={5} 
                                 dataKey="value"
                            >
                                 {specializationData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                       </PieChart>
                  </ResponsiveContainer>
             </div>
        </div>
      </div>

      {/* Overview Cards (Active Users / Pending Approvals / System Health) */}
      <div className="overview-grid">
           <OverviewCard title="Active Users" value={overview.activeUsers} subtitle="Currently online" growth="+15%" badge="71% of registered" />
           <OverviewCard title="System Health" value={overview.systemHealth} subtitle="Overall status" statusBadge="All Systems Operational" statusColor="green" />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-card">
           <div className="card-header">
                <h3>Quick Actions</h3>
                <span className="card-subtitle">Common administrative tasks</span>
           </div>
           <div className="actions-grid">
                <button className="action-btn" onClick={() => navigate('/admin/doctors')}><UserRound size={18} /> Manage Doctors</button>
                <button className="action-btn" onClick={() => navigate('/admin/patients')}><Users size={18} /> View Patients</button>
                <button className="action-btn" onClick={() => navigate('/admin/appointments')}><CalendarHeart size={18} /> Appointments</button>
                <button className="action-btn" onClick={() => navigate('/admin/analytics')}><TrendingUp size={18} /> Analytics</button>
           </div>
      </div>
    </div>
  );
}

// Subcomponents inside file for simplicity and binding
const StatCard = ({ icon, label, value, growth, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-details">
      <span className="stat-label">{label}</span>
      <h2 className="stat-value">{value}</h2>
    </div>
    <div className="stat-growth">
         <TrendingUp size={14} />
         <span>{growth}</span>
    </div>
  </div>
);

const OverviewCard = ({ title, value, subtitle, growth, badge, link, statusBadge, statusColor }) => (
  <div className="overview-card">
    <div className="overview-header">
      <div>
           <span className="overview-title">{title}</span>
           <p className="overview-subtitle">{subtitle}</p>
      </div>
    </div>
    <div className="overview-body">
         {value !== undefined && <h2 className="overview-value">{value}</h2>}
         {growth && <div className="overview-growth"><TrendingUp size={14} /> {growth}</div>}
         {badge && <span className="overview-badge">{badge}</span>}
         {statusBadge && <div className={`status-badge ${statusColor}`}>{statusBadge}</div>}
         {link && <a href="#" className="overview-link">{link}</a>}
    </div>
  </div>
);

export default DashboardPage;
