const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'patient', 'patient.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

const search = `                     endTime: new Date(new Date(startTime).getTime() + 30 * 60000),
                     booked: true`;

const replace = `                     endTime: new Date(new Date(startTime).getTime() + 30 * 60000),
                     booked: false`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully fixed dynamic slot booked flag');
} else {
    console.log('Target content not found in patient.controller.js');
}
