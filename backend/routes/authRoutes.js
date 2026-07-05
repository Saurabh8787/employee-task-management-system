const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../utils/validators');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
