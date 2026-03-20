const express = require("express");
const { register, login, registerHospital } = require("./auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/register-hospital", registerHospital);
router.post("/login", login);

module.exports = router;
