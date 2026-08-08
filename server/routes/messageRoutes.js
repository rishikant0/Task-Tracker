const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, sendMessage)
  .get(protect, getMessages); // query params to filter by team, project, or user

module.exports = router;
