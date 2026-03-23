const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctor.findMany();
  console.log(`Found ${doctors.length} doctors`);

  const today = new Date();
  
  for (const doctor of doctors) {
    console.log(`Creating slots for Dr. ${doctor.name}`);
    
    // Create slots for the next 7 days
    for (let d = 0; d < 7; d++) {
      const slotDate = new Date();
      slotDate.setDate(today.getDate() + d);
      slotDate.setHours(0, 0, 0, 0); // start of day

      // Add 2 slots per day: 10:00 AM and 02:00 PM
      const times = [10, 14]; 
      for (const hour of times) {
         const startTime = new Date(slotDate);
         startTime.setHours(hour, 0, 0, 0);
         
         const endTime = new Date(startTime);
         endTime.setMinutes(endTime.getMinutes() + 30); // 30 mins slot

         await prisma.slot.create({
           data: {
             doctorId: doctor.id,
             date: slotDate,
             startTime: startTime,
             endTime: endTime,
             booked: false
           }
         });
      }
    }
  }
  console.log('Successfully created slots for all doctors for the next 7 days');
}

main().catch(console.error).finally(() => prisma.$disconnect());
