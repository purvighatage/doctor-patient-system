const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'admin-portal', 'DashboardPage', 'DashboardPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const search = `           <OverviewCard title="Active Users" value={overview.activeUsers} subtitle="Currently online" growth="+15%" badge="71% of registered" />
           <OverviewCard title="Pending Approvals" value={overview.pendingApprovals} subtitle="Requires attention" link="Review pending items →" />
           <OverviewCard title="System Health" value={overview.systemHealth} subtitle="Overall status" statusBadge="All Systems Operational" statusColor="green" />`;

const replace = `           <OverviewCard title="Active Users" value={overview.activeUsers} subtitle="Currently online" growth="+15%" badge="71% of registered" />
           <OverviewCard title="System Health" value={overview.systemHealth} subtitle="Overall status" statusBadge="All Systems Operational" statusColor="green" />`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated DashboardPage.jsx');
} else {
    console.log('Target content not found in DashboardPage.jsx');
}
