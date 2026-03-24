const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  // Allows optional +, followed by 10 to 15 digits/spaces/dashes
  const phoneRegex = /^\+?[0-9\-\s]{10}$/;
  return phoneRegex.test(phone);
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length > 0;
};

const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return passwordRegex.test(password);
};

module.exports = { validateEmail, validatePhone, validateName, validatePassword };
