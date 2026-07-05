const { Op } = require('sequelize');
const { Task, Employee } = require('../models');
const { notifyTaskAssigned, notifyTaskCompleted } = require('../utils/notificationService');

// GET /api/tasks?status=&priority=&search=&page=&limit=
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search = '', page = 1, limit = 10 } = req.query;

    const where = {};

    // Employees only see their own tasks; Admins see everything
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) return res.json({ tasks: [], pagination: { total: 0, page: 1, limit: Number(limit), totalPages: 0 } });
      where.assignedEmployeeId = employee.id;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Task.findAndCountAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'name', 'email', 'department'] }],
      order: [['dueDate', 'ASC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      tasks: rows,
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

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Employee, as: 'employee' }],
    });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role === 'Employee' && task.employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: this is not your task.' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, startDate, dueDate, assignedEmployeeId } = req.body;

    const employee = await Employee.findByPk(assignedEmployeeId);
    if (!employee) return res.status(400).json({ message: 'Assigned employee does not exist.' });

    const taskData = {
      title,
      description,
      priority,
      status: status || 'Pending',
      startDate,
      dueDate,
      assignedEmployeeId,
    };

    if (req.file) {
      taskData.attachmentPath = req.file.filename;
      taskData.attachmentOriginalName = req.file.originalname;
    }

    const task = await Task.create(taskData);
    await notifyTaskAssigned(task);

    res.status(201).json({ message: 'Task created.', task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: [{ model: Employee, as: 'employee' }] });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.status === 'Completed') {
      return res.status(400).json({ message: 'Completed tasks cannot be edited.' });
    }

    if (req.user.role === 'Employee' && task.employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: this is not your task.' });
    }

    const { title, description, priority, status, startDate, dueDate, assignedEmployeeId } = req.body;
    const wasCompleted = task.status !== 'Completed' && status === 'Completed';
    const reassigned = assignedEmployeeId && Number(assignedEmployeeId) !== task.assignedEmployeeId;

    const updateData = { title, description, priority, status, startDate, dueDate, assignedEmployeeId };
    if (req.file) {
      updateData.attachmentPath = req.file.filename;
      updateData.attachmentOriginalName = req.file.originalname;
    }

    await task.update(updateData);

    if (wasCompleted) await notifyTaskCompleted(task);
    if (reassigned) await notifyTaskAssigned(task);

    res.json({ message: 'Task updated.', task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    await task.destroy();
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
