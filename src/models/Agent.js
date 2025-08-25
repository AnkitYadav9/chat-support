const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  agentId: { type: String, required: true, unique: true },
  activeSessions: { type: Number, default: 0 }
});

module.exports = mongoose.model('Agent', AgentSchema);
