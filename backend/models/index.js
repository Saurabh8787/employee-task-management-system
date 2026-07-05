const { sequelize } = require('../config/db');
const User = require('./User');
const Employee = require('./Employee');
const Task = require('./Task');
const Notification = require('./Notification');

// User <-> Employee (1:1, optional link so employee can log in)
User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeProfile' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Employee <-> Task (1:many)
Employee.hasMany(Task, { foreignKey: 'assignedEmployeeId', as: 'tasks' });
Task.belongsTo(Employee, { foreignKey: 'assignedEmployeeId', as: 'employee' });

// User <-> Notification (1:many)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Task <-> Notification (1:many)
Task.hasMany(Notification, { foreignKey: 'taskId', as: 'notifications' });
Notification.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = { sequelize, User, Employee, Task, Notification };
