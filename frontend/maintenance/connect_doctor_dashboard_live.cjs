const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'doctor-portal', 'dashboard', 'DashboardPage.jsx');
if (fs.existsSync(dashboardPath)) {
    let content = fs.readFileSync(dashboardPath, 'utf8');

    const searchState = `  // Mock data matching the images
  const stats = [
    { title: "Today's Appointments", value: "8", icon: <Calendar size={24} />, trend: "+12%", color: "#e3f2fd", iconColor: "#1e88e5" },
    { title: "Total Patients", value: "156", icon: <Users size={24} />, trend: "+8%", color: "#e8f5e9", iconColor: "#43a047" },
    { title: "Pending", value: "3", icon: <Clock size={24} />, trend: null, color: "#fff8e1", iconColor: "#ffb300" },
    { title: "Rating", value: "4.8/5.0", icon: <Star size={24} />, trend: null, color: "#f3e5f5", iconColor: "#8e24aa" }
  ];

  const schedule = [
    { id: 1, name: "Sarah Wilson", condition: "Heart palpitations", time: "11:00 AM", initial: "SW" },
    // Can add more if wanted
  ];

  const chartData = [
    { day: 'Mon', appointments: 12 },
    { day: 'Tue', appointments: 15 },
    { day: 'Wed', appointments: 10 },
    { day: 'Thu', appointments: 18 },
    { day: 'Fri', appointments: 14 },
    { day: 'Sat', appointments: 8 },
    { day: 'Sun', appointments: 4 }
  ];`;

    const replaceState = `  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/doctors/appointments', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Compute stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppts = appointments.filter(app => {
    const appDate = new Date(app.slot.startTime);
    appDate.setHours(0, 0, 0, 0);
    return appDate.getTime() === today.getTime() && app.status === 'BOOKED';
  });

  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;
  const pendingAppts = appointments.filter(a => a.status === 'PENDING').length;

  const stats = [
    { title: "Today's Appointments", value: todayAppts.length.toString(), icon: <Calendar size={24} />, trend: null, color: "#e3f2fd", iconColor: "#1e88e5" },
    { title: "Total Patients", value: uniquePatients.toString(), icon: <Users size={24} />, trend: null, color: "#e8f5e9", iconColor: "#43a047" },
    { title: "Pending", value: pendingAppts.toString(), icon: <Clock size={24} />, trend: null, color: "#fff8e1", iconColor: "#ffb300" },
    { title: "Rating", value: "4.8/5.0", icon: <Star size={24} />, trend: null, color: "#f3e5f5", iconColor: "#8e24aa" }
  ];

  const schedule = todayAppts.map(app => ({
    id: app.id,
    name: app.patient.name,
    condition: "Scheduled Consultation",
    time: new Date(app.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    initial: app.patient.name.split(' ').map(n => n[0]).join('').toUpperCase()
  }));

  // Build chartData dynamically
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = days.map(d => ({ day: d, appointments: 0 }));
  appointments.forEach(a => {
      const dayIdx = new Date(a.slot.startTime).getDay();
      chartData[dayIdx].appointments += 1;
  });`;

    const searchHeader = `<p>You have 8 appointments today</p>`;
    const replaceHeader = `<p>You have {todayAppts.length} appointments today</p>`;

    const searchSchedule = `<div className="schedule-list">
            {schedule.map(app => (`;
            
    const replaceSchedule = `<div className="schedule-list">
            {loading ? <div className="loading-sm">Loading today's schedule...</div> : schedule.length === 0 ? <div className="empty-sm">No appointments for today.</div> : schedule.map(app => (`;

    if (content.includes(searchState)) {
        content = content.replace(searchState, replaceState);
        content = content.replace(searchHeader, replaceHeader);
        content = content.replace(searchSchedule, replaceSchedule);
        fs.writeFileSync(dashboardPath, content);
        console.log('Successfully connected Doctor Dashboard to backend');
    } else {
        console.log('Target states placeholder not found in DashboardPage.jsx');
    }
}
