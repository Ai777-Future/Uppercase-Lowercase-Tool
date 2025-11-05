// Minimal live-location server (consent-based)
// Run: npm init -y && npm i express socket.io && node server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.emit('joined', roomId);
  });

  socket.on('live-location', ({ roomId, coords }) => {
    socket.to(roomId).emit('live-location', coords);
  });

  socket.on('stop-stream', (roomId) => {
    socket.to(roomId).emit('stop-stream');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Live location server running on http://localhost:${PORT}`);
});
