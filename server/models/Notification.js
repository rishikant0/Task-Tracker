const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // the receiver
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // the one who triggered it
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String, 
      enum: ['info', 'warning', 'success', 'error', 'mention', 'assign', 'invite', 'comment', 'deadline'],
      default: 'info',
    },
    link: {
      type: String, // e.g. /tasks/123 or /teams/abc
    },
    isRead: {
      type: Boolean,
      default: false,
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
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
