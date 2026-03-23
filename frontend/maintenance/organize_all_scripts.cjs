const fs = require('fs');
const path = require('path');

function moveFiles(baseDir, folderName, files) {
    const targetDir = path.join(baseDir, folderName);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }
    
    files.forEach(file => {
        const oldPath = path.join(baseDir, file);
        const newPath = path.join(targetDir, file);
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`Moved \${file} to \${folderName}/`);
        }
    });
}

// 1. Root Scripts
const rootScripts = [
    'add_select_icons.cjs',
    'fix_doctors_search_filter.cjs',
    'fix_url_search_params_v2.cjs',
    'remove_insensitive_mode.cjs'
];
moveFiles(__dirname, 'maintenance_scripts', rootScripts);

// 2. Frontend Scripts
const frontendDir = path.join(__dirname, 'frontend');
const frontendScripts = [
    'add_change_password_routes.cjs',
    'add_conflict_validation.cjs',
    'add_doctor_appointments_page.cjs',
    'add_doctor_patients_page.cjs',
    'add_doctor_routes.cjs',
    'add_home_search_bar.cjs',
    'add_route_guards.cjs',
    'add_time_validation.cjs',
    'connect_doctor_dashboard_live.cjs',
    'connect_layout_appointments.cjs',
    'connect_page_appointments.cjs',
    'fix_booking_alerts.cjs',
    'fix_booking_id_context.cjs',
    'fix_patient_completed_appointments.cjs',
    'fix_slots_comparison.cjs',
    'fix_token_retrieval.cjs',
    'fix_url_search_params.cjs',
    'make_doctor_profile_dynamic.cjs',
    'replace_appointments_api.cjs',
    'replace_approvals.cjs',
    'replace_approvals.js',
    'replace_book_handler.cjs',
    'revert_page_appointments_mockup.cjs'
];
moveFiles(frontendDir, 'maintenance_scripts', frontendScripts);

console.log('Finished organizing scripts.');
