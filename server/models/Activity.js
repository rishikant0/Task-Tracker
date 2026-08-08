const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    action: {
      type: String, // e.g. 'created', 'updated', 'deleted', 'joined', 'invited'
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'Team', 'User', 'Comment', 'File'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String, // Human readable summary, e.g. 'created task "Fix Bug"'
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // flexible for old/new values
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
