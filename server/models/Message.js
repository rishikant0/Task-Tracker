const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    content: {
      type: String,
      default: '',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chatType: {
      type: String,
      enum: ['direct', 'team', 'project'],
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
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
