const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = jwt.sign(
  { id: 1, role: "PATIENT" }, 
  "supersecretkey123",
  { expiresIn: "1h" }
);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden: Invalid token" });
    req.user = user; // user should have {id, role}
    next();
  });
};

const authorize = (role) => (req, res, next) => {
  console.log("Authorize check:", req.user); // <-- add this
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== role)
    return res.status(403).json({ message: "Forbidden: Access denied" });
  next();
};

module.exports = { authenticate, authorize };