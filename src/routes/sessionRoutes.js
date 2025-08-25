const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const Agent = require('../models/Agent');
const Session = require('../models/Session');
const Message = require('../models/Message');

//  Start a session
router.post('/start-session', auth, async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const agent = await Agent.findOne({ activeSessions: { $lt: 2 } }).sort({ activeSessions: 1 });
    if (!agent) return res.status(503).json({ error: 'No agents available, try later' });

    const sessionId = uuidv4();
    const session = new Session({
      sessionId,
      userId,
      agentId: agent.agentId,
      startTime: new Date()
    });
    await session.save();

    agent.activeSessions = (agent.activeSessions || 0) + 1;
    await agent.save();

    res.json({ sessionId, agentId: agent.agentId });
  } catch (err) {
    next(err);
  }
});

//  Get all sessions 
router.get('/sessions', auth, async (req, res, next) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

//  Get all messages for a session
router.get('/messages/:sessionId', auth, async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});
//  Send a message in a session
router.post('/messages', auth, async (req, res, next) => {
  try {
    const { sessionId, sender, role, message } = req.body;

    if (!sessionId || !sender || !role || !message) {
      return res.status(400).json({ error: 'sessionId, sender, role, and message are required' });
    }

    // Check if session exists
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save the message
    const newMessage = new Message({
      sessionId,
      sender,
      role,
      message
    });

    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (err) {
    next(err);
  }
});

//  End a session
router.post('/end-session/:sessionId', auth, async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'ended') return res.json({ message: 'Session already ended' });

    session.endTime = new Date();
    session.status = 'ended';
    await session.save();

    const agent = await Agent.findOne({ agentId: session.agentId });
    if (agent && agent.activeSessions > 0) {
      agent.activeSessions -= 1;
      await agent.save();
    }

    res.json({ message: 'Session ended' });
  } catch (err) {
    next(err);
  }
});



module.exports = router;
