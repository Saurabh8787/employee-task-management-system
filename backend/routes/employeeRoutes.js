const express = require('express');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { employeeValidation } = require('../utils/validators');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('Admin')); // all employee management routes are Admin-only

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', employeeValidation, createEmployee);
router.put('/:id', employeeValidation, updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
