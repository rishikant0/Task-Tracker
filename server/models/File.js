const mongoose = require('mongoose');

const fileSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // For Cloudinary or similar
      required: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('File', fileSchema);
