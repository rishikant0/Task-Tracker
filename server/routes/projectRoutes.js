const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects); // optionally filter by teamId

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
