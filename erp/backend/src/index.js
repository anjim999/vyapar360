// src/index.js - Main Server Entry Point with Socket.io
import http from 'http';
import app from './app.js';
import { PORT } from './config/env.js';
import { runMigrations } from './db/migrations.js';
import { initializeSocket } from './utils/socketService.js';

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Run database migrations on startup
runMigrations().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready for connections`);
  });
});
