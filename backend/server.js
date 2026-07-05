require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { Op } = require('sequelize');

const { sequelize, connectDB } = require('./config/db');
const { Task } = require('./models');
const { notifyTasksDueSoon } = require('./utils/notificationService');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

// Daily cron job (runs every hour) that flags tasks due within the next 24 hours
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dueSoonTasks = await Task.findAll({
      where: {
        status: { [Op.ne]: 'Completed' },
        dueDate: { [Op.between]: [now.toISOString().slice(0, 10), in24h.toISOString().slice(0, 10)] },
      },
    });
    await Promise.all(dueSoonTasks.map((task) => notifyTasksDueSoon(task)));
  } catch (error) {
    console.error('Due-soon notification cron failed:', error.message);
  }
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await sequelize.sync(); // creates tables if they don't exist yet (schema.sql is the source of truth for prod)
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();

module.exports = app;
