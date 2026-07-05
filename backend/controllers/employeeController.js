const { Op } = require('sequelize');
const { Employee, Task } = require('../models');

// GET /api/employees?search=&sortBy=&order=&page=&limit=
const getEmployees = async (req, res, next) => {
  try {
    const { search = '', sortBy = 'createdAt', order = 'DESC', page = 1, limit = 10 } = req.query;

    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { department: { [Op.like]: `%${search}%` } },
            { designation: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const allowedSortFields = ['name', 'email', 'department', 'designation', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Employee.findAndCountAll({
      where,
      order: [[sortField, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      employees: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ employee });
  } catch (error) {
    next(error);
  }
};

// POST /api/employees
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, designation } = req.body;
    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An employee with this email already exists.' });
    }
    const employee = await Employee.create({ name, email, department, designation });
    res.status(201).json({ message: 'Employee created.', employee });
  } catch (error) {
    next(error);
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });

    const { name, email, department, designation } = req.body;

    if (email && email !== employee.email) {
      const existing = await Employee.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'An employee with this email already exists.' });
      }
    }

    await employee.update({ name, email, department, designation });
    res.json({ message: 'Employee updated.', employee });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });

    const taskCount = await Task.count({ where: { assignedEmployeeId: employee.id } });
    if (taskCount > 0) {
      return res.status(400).json({
        message: `Cannot delete employee with ${taskCount} assigned task(s). Reassign or delete their tasks first.`,
      });
    }

    await employee.destroy();
    res.json({ message: 'Employee deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
