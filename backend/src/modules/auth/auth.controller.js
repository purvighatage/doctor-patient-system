const {
  registerPatient,
  loginUser,
} = require("./auth.service");

const register = async (req, res) => {
  try {
    const user = await registerPatient(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login };