const jwt = require("jsonwebtoken");

// Make sure this matches your JWT_SECRET in .env
const token = jwt.sign(
  { id: 1, role: "PATIENT" },
  "supersecretkey123",
  { expiresIn: "1h" }
);

console.log(token);