const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  agentId: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, default: 'active' } // active | ended
});

module.exports = mongoose.model('Session', SessionSchema);
