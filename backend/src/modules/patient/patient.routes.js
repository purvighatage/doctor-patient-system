// in app.js or modules/patient/patient.routes.js
const db = require("./config/db");

app.post("/api/patient", authenticate, authorize("PATIENT"), (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const sql = "INSERT INTO patients (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Patient added", patientId: result.insertId });
  });
});