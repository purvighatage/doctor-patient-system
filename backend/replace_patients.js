const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'admin', 'admin.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

const search = `    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: {
        user: { select: { createdAt: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(patients);`;

const replace = `    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: {
        user: { select: { email: true, createdAt: true } },
        appointments: {
          where: { doctor: { hospitalId: hospital.id } },
          include: { doctor: { select: { name: true } } }
        }
      },
      orderBy: { id: 'desc' }
    });

    const mappedPatients = patients.map(p => ({
      ...p,
      treatingDoctors: [...new Set(p.appointments.map(a => a.doctor.name))]
    }));

    res.json(mappedPatients);`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated admin.controller.js');
} else {
    console.log('Target content not found in admin.controller.js');
}
