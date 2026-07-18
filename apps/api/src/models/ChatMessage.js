const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  attachments: [{
    type: String, // URLs to S3/Cloudinary
  }],
  readAt: {
    type: Date,
  }
}, { timestamps: true });

// Index for fetching conversation between two users efficiently
chatMessageSchema.index({ schoolId: 1, senderId: 1, receiverId: 1, createdAt: -1 });
chatMessageSchema.index({ schoolId: 1, receiverId: 1, senderId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
