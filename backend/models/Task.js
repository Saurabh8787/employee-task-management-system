const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date',
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'due_date',
  },
  assignedEmployeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assigned_employee_id',
    references: { model: 'employees', key: 'id' },
  },
  attachmentPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'attachment_path',
  },
  attachmentOriginalName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'attachment_original_name',
  },
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true,
  validate: {
    dueDateNotBeforeStartDate() {
      if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
        throw new Error('Due Date must not be earlier than Start Date.');
      }
    },
  },
});

module.exports = Task;
