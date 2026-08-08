const mongoose = require('mongoose');

const invitationSchema = mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member', 'viewer'],
      default: 'member'
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    },
    expiresAt: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Invitation', invitationSchema);
