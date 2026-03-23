const fs = require('fs');
const path = require('path');

const rootTarget = path.join(__dirname, 'maintenance_scripts');
const frontendTarget = path.join(__dirname, 'frontend', 'maintenance_scripts');

if (fs.existsSync(frontendTarget)) {
    const files = fs.readdirSync(frontendTarget);
    files.forEach(file => {
        const oldPath = path.join(frontendTarget, file);
        const newPath = path.join(rootTarget, file);
        if (fs.existsSync(oldPath)) {
            // If they collide, append a suffix or just overwrite since they are distinct mostly
            fs.renameSync(oldPath, newPath);
            console.log(`Moved \${file} to root maintenance_scripts/`);
        }
    });
    
    // Remove the now-empty frontend folder
    fs.rmdirSync(frontendTarget);
    console.log('Removed empty frontend/maintenance_scripts folder.');
} else {
    console.log('Frontend maintenance_scripts folder does not exist.');
}
