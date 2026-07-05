const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword, role });

    // If the new user is an Employee, create a linked Employee profile
// If the new user is an Employee, link to an existing Employee record
// (e.g. one the Admin already created) or create a new one if none exists.
if (role === 'Employee') {
  const existingEmployee = await Employee.findOne({ where: { email } });
  if (existingEmployee) {
    if (existingEmployee.userId) {
      // Already claimed by another account — shouldn't normally happen
      // since emails are unique, but guard against it just in case.
      await user.destroy();
      return res.status(409).json({
        message: 'This employee record is already linked to another account.',
      });
    }
    existingEmployee.userId = user.id;
    await existingEmployee.save();
  } else {
    await Employee.create({
      name: fullName,
      email,
      department: 'Unassigned',
      designation: 'Unassigned',
      userId: user.id,
    });
  }
}

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user, !!rememberMe);
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
// Stateless JWT logout: the client discards the token. Endpoint exists for a clean API contract.
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, logout, getMe };
