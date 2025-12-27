// Teams Backend - Main Server Entry Point with Socket.io
import http from 'http';
import app from './app.js';
import { PORT } from './config/env.js';
import { initializeSocket } from './utils/socketService.js';

const server = http.createServer(app);

// Initialize Socket.io for Teams
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Teams Backend running on port ${PORT}`);
    console.log(`📡 WebSocket ready for chat connections`);
});
