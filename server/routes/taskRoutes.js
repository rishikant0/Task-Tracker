const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskOrder,
  getAnalytics
} = require('../controllers/taskController');
const { validateTask } = require('../middlewares/validateTask');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/analytics/dashboard').get(getAnalytics);
router.route('/order').put(updateTaskOrder);

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .get(getTask)
  .put(validateTask, updateTask)
  .delete(deleteTask);

module.exports = router;
