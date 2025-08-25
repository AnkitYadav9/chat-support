const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

// Create agent (POST /api/agents) - for testing
router.post('/agents', auth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const agent = new Agent({ name, agentId: uuidv4() });
    await agent.save();
    res.json(agent);
  } catch (err) {
    next(err);
  }
});

// List agents (GET /api/agents)
router.get('/agents', auth, async (req, res, next) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
