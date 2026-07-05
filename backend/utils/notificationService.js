const { Notification, Employee, User } = require('../models');
const { sendEmail } = require('./emailService');

const notifyTaskAssigned = async (task) => {
  const employee = await Employee.findByPk(task.assignedEmployeeId, { include: 'user' });
  if (!employee || !employee.userId) return;

  await Notification.create({
    userId: employee.userId,
    taskId: task.id,
    type: 'TASK_ASSIGNED',
    message: `You have been assigned a new task: "${task.title}".`,
  });

  if (employee.user) {
    await sendEmail({
      to: employee.user.email,
      subject: 'New Task Assigned',
      text: `Hi ${employee.name}, you have been assigned a new task: "${task.title}", due ${task.dueDate}.`,
    });
  }
};

const notifyTaskCompleted = async (task) => {
  const employee = await Employee.findByPk(task.assignedEmployeeId);
  if (!employee) return;

  // Notify all admins that a task was completed
  const admins = await User.findAll({ where: { role: 'Admin' } });
  await Promise.all(
    admins.map((admin) =>
      Notification.create({
        userId: admin.id,
        taskId: task.id,
        type: 'TASK_COMPLETED',
        message: `Task "${task.title}" assigned to ${employee.name} has been marked complete.`,
      })
    )
  );
};

// Called by the daily cron job to notify employees about tasks due within 1 day
const notifyTasksDueSoon = async (task) => {
  const employee = await Employee.findByPk(task.assignedEmployeeId, { include: 'user' });
  if (!employee || !employee.userId) return;

  const existing = await Notification.findOne({
    where: { taskId: task.id, type: 'TASK_DUE_SOON' },
  });
  if (existing) return; // avoid duplicate notifications

  await Notification.create({
    userId: employee.userId,
    taskId: task.id,
    type: 'TASK_DUE_SOON',
    message: `Task "${task.title}" is due within 1 day.`,
  });

  if (employee.user) {
    await sendEmail({
      to: employee.user.email,
      subject: 'Task Due Soon',
      text: `Hi ${employee.name}, your task "${task.title}" is due on ${task.dueDate}.`,
    });
  }
};

module.exports = { notifyTaskAssigned, notifyTaskCompleted, notifyTasksDueSoon };
