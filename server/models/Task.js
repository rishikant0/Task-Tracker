const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    category: {
      type: String,
      default: 'Work',
    },
    dueDate: {
      type: Date,
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 0,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    columnOrder: {
      type: Number,
      default: 0,
    },
    labels: [
      {
        name: String,
        color: String
      }
    ],
    // Relationships
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    // Attachments
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      }
    ],
    // Checklist
    checklist: [
      {
        text: String,
        isCompleted: { type: Boolean, default: false },
      }
    ],
    // Recurring
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'] },
      customDays: Number,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
