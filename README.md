#  Chat Support System

A real-time chat support system built using **Node.js**, **Express**, and **Socket.io**.  
This project allows users to connect with support agents and exchange messages in real-time.  
It also includes a simple **frontend** for testing the APIs and socket integration.

---

##  Project Overview
This project demonstrates:
- Setting up a Node.js + Express backend.
- Real-time communication using **Socket.io**.
- Authentication & middlewares.
- Logging with **Winston**.
- API + Socket integration.
- Simple frontend integration.

---

##  Tech Stack
### **Backend**
- Node.js
- Express.js
- Socket.io
- Winston (Logging)
- dotenv



---

##  Project Structure

chat-support/
├── logs/                     # Logs for API and socket events
├── node_modules/             # Dependencies
├── public/                   # Frontend files for testing
│   ├── agent.html            # Agent-side chat interface
│   ├── user.html             # User-side chat interface
├── src/
│   ├── config/
│   │   └── db.js            # Database config 
│   │   └── logger.js        # Winston logger setup
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Global error handler
│   │   └── requestLogger.js # Logs all API requests
│   ├── models/
│   │   ├── Agent.js         # Agent schema
│   │   ├── Message.js       # Message schema
│   │   └── Session.js       # Session schema
│   ├── routes/
│   │   ├── agentRoutes.js   # Routes for agent actions
│   │   └── sessionRoutes.js # Routes for session & chat
├── .env                     # Environment variables
├── .env.example             # Example env file
├── .gitignore
├── index.js                 # Entry point for the application
├── package.json
└── README.md

## Features

Real-time chat using Socket.IO

Separate interfaces for Agents & Users

Chat session management

API routes for messages & sessions

Request logging with Winston

Error handling middleware

Modular & scalable project structure
