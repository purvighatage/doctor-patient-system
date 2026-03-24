const {
  registerPatient,
  loginUser,
  registerAdminWithHospital,
} = require("./auth.service");
const { validateEmail, validatePhone, validateName, validatePassword } = require("../../utils/validators");

const registerHospital = async (req, res) => {
  try {
    const { adminName, email, password, hospitalName, address, phone } = req.body;
    if (!validateName(adminName) || !email || !password || !validateName(hospitalName) || !address) {
      return res.status(400).json({ message: "Valid Admin name, email, password, valid hospital name, and address are required" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 symbol" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid admin email format" });
    }
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ message: "Invalid hospital phone number format" });
    }
    const user = await registerAdminWithHospital(req.body);
    res.status(201).json({ message: "Hospital and Admin registered successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, dob, password } = req.body;
    if (!validateName(name) || !email || !phone || !dob || !password) {
      return res.status(400).json({ message: "All fields (valid name, email, phone, dob, password) are required" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 symbol" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid patient email format" });
    }
    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Invalid patient phone number format" });
    }
    const user = await registerPatient(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login, registerHospital };