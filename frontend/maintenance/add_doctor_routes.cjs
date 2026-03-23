const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const searchImports = `import AnalyticsPage from './admin-portal/analytics/AnalyticsPage';`;
const replaceImports = `import AnalyticsPage from './admin-portal/analytics/AnalyticsPage';

// Doctor Portal Imports
import DoctorPortalLayout from './doctor-portal/DoctorPortalLayout';
import DoctorDashboardPage from './doctor-portal/dashboard/DashboardPage';`;

const searchRoutes = `        </Route>
      </Routes>`;

const replaceRoutes = `        </Route>

        {/* Doctor Portal */}
        <Route path="/doctor" element={<DoctorPortalLayout />}>
          <Route index element={<DoctorDashboardPage />} />
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="appointments" element={<div>Appointments</div>} />
          <Route path="patients" element={<div>Patients</div>} />
        </Route>

      </Routes>`;

if (content.includes(searchImports) && content.includes(searchRoutes)) {
    content = content.replace(searchImports, replaceImports);
    content = content.replace(searchRoutes, replaceRoutes);
    fs.writeFileSync(filePath, content);
    console.log('Successfully added Doctor Portal routes to App.jsx');
} else {
    console.log('Target blocks for App.jsx routes replacement not found');
}
