const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("== AUTH HEADER RECEIVED ==", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing Token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden: Invalid token" });
    req.user = user; 
    next();
  });
};

const authorize = (...roles) => (req, res, next) => {
  console.log("== AUTHORIZE CHECK ==", { userRole: req.user?.role, requiredRoles: roles });
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Forbidden: Access denied for role. User has ${req.user.role}, needs ${roles.join(',')}` });
  }
  next();
};

module.exports = { authenticate, authorize };