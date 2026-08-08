const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      }
    ],
    mentions: [
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

module.exports = mongoose.model('Comment', commentSchema);
