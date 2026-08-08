const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFiles,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .post(protect, upload.single('file'), uploadFile)
  .get(protect, getFiles);

router.route('/:id')
  .delete(protect, deleteFile);

module.exports = router;
