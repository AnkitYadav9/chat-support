const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  sender: { type: String, required: true }, // userId or agentId
  role: { type: String, required: true },   // 'user' or 'agent'
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
