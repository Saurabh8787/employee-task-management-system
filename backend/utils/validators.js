const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter.')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number.');

const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  passwordRule,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm Password do not match.');
    }
    return true;
  }),
  body('role').isIn(['Admin', 'Employee']).withMessage('Role must be Admin or Employee.'),
  handleValidation,
];

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('department').trim().notEmpty().withMessage('Department is required.'),
  body('designation').trim().notEmpty().withMessage('Designation is required.'),
  handleValidation,
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority.'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status.'),
  body('startDate').isISO8601().withMessage('A valid Start Date is required.'),
  body('dueDate').isISO8601().withMessage('A valid Due Date is required.')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Due Date must not be earlier than Start Date.');
      }
      return true;
    }),
  body('assignedEmployeeId').isInt().withMessage('An assigned employee is required.'),
  handleValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  employeeValidation,
  taskValidation,
  handleValidation,
};
