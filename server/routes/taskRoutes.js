const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getAnalytics,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/analytics/dashboard').get(getAnalytics);

router.route('/').get(getTasks).post(createTask);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
