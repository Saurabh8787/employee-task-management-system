const { Op } = require('sequelize');
const { Task, Employee } = require('../models');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    if (req.user.role === 'Admin') {
      const [totalEmployees, totalTasks, completedTasks, pendingTasks] = await Promise.all([
        Employee.count(),
        Task.count(),
        Task.count({ where: { status: 'Completed' } }),
        Task.count({ where: { status: { [Op.ne]: 'Completed' } } }),
      ]);

      return res.json({
        view: 'Admin',
        totalEmployees,
        totalTasks,
        completedTasks,
        pendingTasks,
      });
    }

    // Employee view
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) {
      return res.json({ view: 'Employee', myTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });
    }

    const [myTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      Task.count({ where: { assignedEmployeeId: employee.id } }),
      Task.count({ where: { assignedEmployeeId: employee.id, status: 'Completed' } }),
      Task.count({ where: { assignedEmployeeId: employee.id, status: { [Op.ne]: 'Completed' } } }),
      Task.count({
        where: {
          assignedEmployeeId: employee.id,
          status: { [Op.ne]: 'Completed' },
          dueDate: { [Op.lt]: today },
        },
      }),
    ]);

    res.json({ view: 'Employee', myTasks, completedTasks, pendingTasks, overdueTasks });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
