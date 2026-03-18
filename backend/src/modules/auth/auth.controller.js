const {
  registerPatient,
  loginUser,
} = require("./auth.service");

const register = async (req, res) => {
  try {
    const { name, email, phone, dob, password } = req.body;
    if (!name || !email || !phone || !dob || !password) {
      return res.status(400).json({ message: "All fields (name, email, phone, dob, password) are required" });
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

module.exports = { register, login };