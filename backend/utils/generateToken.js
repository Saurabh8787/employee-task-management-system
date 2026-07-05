const jwt = require('jsonwebtoken');

// rememberMe extends token life so the user stays logged in longer
const generateToken = (user, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '30d'
    : process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

module.exports = generateToken;
