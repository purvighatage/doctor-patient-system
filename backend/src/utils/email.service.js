const nodemailer = require("nodemailer");

// Create a reusable transporter using Gmail (for demonstration)
// In a real production app, use environment variables and an App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (patientEmail, patientName, doctorName, date, time) => {
  try {
    const mailOptions = {
      from: `"Doctor-Patient System" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: "Appointment Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">Appointment Confirmed!</h2>
          <p>Hello <strong>${patientName}</strong>,</p>
          <p>Your appointment has been successfully booked.</p>
          <hr />
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Doctor:</strong> ${doctorName}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
          </ul>
          <hr />
          <p>If you need to cancel or reschedule, please log into your patient dashboard.</p>
          <p>Stay healthy!</p>
          <p><em>- The Doctor-Patient Clinic Team</em></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

module.exports = {
  sendBookingConfirmation,
};
