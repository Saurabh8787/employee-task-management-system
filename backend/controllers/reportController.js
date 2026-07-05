const ExcelJS = require('exceljs');
const { Task, Employee } = require('../models');

const REPORT_COLUMNS = [
  { header: 'Task ID', key: 'id', width: 10 },
  { header: 'Title', key: 'title', width: 30 },
  { header: 'Description', key: 'description', width: 40 },
  { header: 'Priority', key: 'priority', width: 12 },
  { header: 'Status', key: 'status', width: 15 },
  { header: 'Start Date', key: 'startDate', width: 14 },
  { header: 'Due Date', key: 'dueDate', width: 14 },
  { header: 'Assigned Employee', key: 'employeeName', width: 25 },
  { header: 'Department', key: 'department', width: 20 },
];

// Fetches the raw task rows for a given report type
const getReportData = async ({ type, employeeId }) => {
  const where = {};
  if (type === 'completed') where.status = 'Completed';
  if (type === 'pending') where.status = { [require('sequelize').Op.ne]: 'Completed' };
  if (employeeId) where.assignedEmployeeId = employeeId;

  const tasks = await Task.findAll({
    where,
    include: [{ model: Employee, as: 'employee', attributes: ['name', 'department'] }],
    order: [['dueDate', 'ASC']],
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    priority: t.priority,
    status: t.status,
    startDate: t.startDate,
    dueDate: t.dueDate,
    employeeName: t.employee ? t.employee.name : 'Unassigned',
    department: t.employee ? t.employee.department : '',
  }));
};

// GET /api/reports?type=completed|pending|employee-wise&employeeId=&format=excel|csv
const generateReport = async (req, res, next) => {
  try {
    const { type = 'completed', employeeId, format = 'excel' } = req.query;

    if (!['completed', 'pending', 'employee-wise'].includes(type)) {
      return res.status(400).json({ message: 'Invalid report type.' });
    }

    const data = await getReportData({
      type: type === 'employee-wise' ? null : type,
      employeeId: type === 'employee-wise' ? employeeId : undefined,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    sheet.columns = REPORT_COLUMNS;
    sheet.getRow(1).font = { bold: true };
    data.forEach((row) => sheet.addRow(row));

    const filenameBase = `${type}-tasks-report-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);
      await workbook.csv.write(res);
      return res.end();
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport };
