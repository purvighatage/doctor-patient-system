const fs = require('fs');
const path = require('path');

// 1. Update App.jsx
const appPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');

    // Add ProfilePage import
    const searchImports = `import AnalyticsPage from './admin-portal/analytics/AnalyticsPage';`;
    const replaceImports = `import AnalyticsPage from './admin-portal/analytics/AnalyticsPage';
import AdminProfilePage from './admin-portal/profile/ProfilePage';`;

    // Inject Route
    const searchRoute = `          <Route path="analytics" element={<AnalyticsPage />} />`;
    const replaceRoute = `          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />`;

    if (content.includes(searchRoute)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchRoute, replaceRoute);
        fs.writeFileSync(appPath, content);
        console.log('Successfully added AdminProfilePage route to App.jsx');
    } else {
        console.log('Target Route placeholder not found in App.jsx');
    }
}

// 2. Update AdminPortalLayout.jsx
const layoutPath = path.join(__dirname, 'frontend', 'src', 'admin-portal', 'AdminPortalLayout.jsx');
if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf8');

    const searchMenu = `    { path: "/admin/analytics", icon: <BarChart3 size={20} />, label: "Analytics" }
  ];`;

    const replaceMenu = `    { path: "/admin/analytics", icon: <BarChart3 size={20} />, label: "Analytics" },
    { path: "/admin/profile", icon: <UserRound size={20} />, label: "Profile" }
  ];`;

    if (content.includes(searchMenu)) {
        content = content.replace(searchMenu, replaceMenu);
        fs.writeFileSync(layoutPath, content);
        console.log('Successfully added Profile link to sidebar menuItems');
    } else {
        console.log('Target menuItems block not found in AdminPortalLayout.jsx');
    }
}
