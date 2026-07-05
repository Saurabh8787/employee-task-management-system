const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { taskValidation } = require('../utils/validators');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authorize('Admin'), upload.single('attachment'), taskValidation, createTask);
router.put('/:id', upload.single('attachment'), updateTask);
router.delete('/:id', authorize('Admin'), deleteTask);

module.exports = router;
