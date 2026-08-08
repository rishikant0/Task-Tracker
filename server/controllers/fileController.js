const File = require('../models/File');
const cloudinary = require('cloudinary').v2;

const uploadFile = async (req, res) => {
  // Using a mock response for now, in a real scenario multer would have attached req.file
  // Assuming req.file is populated by multer-storage-cloudinary
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { team, project, task } = req.body;

    const file = await File.create({
      name: req.file.originalname, // could be modified
      originalName: req.file.originalname,
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploader: req.user._id,
      team,
      project,
      task
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const { team, project, task } = req.query;
    let query = {};
    if (team) query.team = team;
    if (project) query.project = project;
    if (task) query.task = task;

    const files = await File.find(query).populate('uploader', 'name avatar');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Ensure user has permission (is uploader or admin)
    if (file.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete from cloudinary
    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId);
    }

    await file.remove();
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile
};
