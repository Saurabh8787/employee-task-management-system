const express = require('express');
const { generateReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, authorize('Admin'), generateReport);

module.exports = router;
