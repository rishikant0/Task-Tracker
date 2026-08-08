const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'On Hold', 'Completed', 'Archived'],
      default: 'Active',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#6366F1'
    },
    dueDate: {
      type: Date
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
