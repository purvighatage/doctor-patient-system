const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'backend', 'src', 'modules', 'patient', 'patient.controller.js');
if (fs.existsSync(controllerPath)) {
    let content = fs.readFileSync(controllerPath, 'utf8');

    // 1. Fix OR filter
    const searchOR = `    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } }
      ];
    }`;

    const replaceOR = `    if (search) {
      filters.OR = [
        { name: { contains: search } },
        { specialty: { contains: search } }
      ];
    }`;

    // 2. Fix Specialty filter
    const searchSpec = `    if (specialty) {
      filters.specialty = { contains: specialty, mode: 'insensitive' };
    }`;

    const replaceSpec = `    if (specialty) {
      filters.specialty = { contains: specialty };
    }`;

    if (content.includes(searchOR)) {
        content = content.replace(searchOR, replaceOR);
        content = content.replace(searchSpec, replaceSpec);
        fs.writeFileSync(controllerPath, content);
        console.log('Successfully removed mode: insensitive from Prisma filters');
    } else {
        console.log('Target Search OR block or specialty block not found in patient.controller.js');
    }
} else {
    console.log('patient.controller.js path does not exist');
}
