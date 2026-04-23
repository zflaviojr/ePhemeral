const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e7 // 10MB to support Base64 photos
});

let rooms = [
  { id: 'fixed-1', name: 'Starbucks Central', type: 'fixed', distance: 150, isVerified: true, isOpen: true, participants: [] },
  { id: 'adhoc-2', name: 'Almoço no Parque', type: 'adhoc', distance: 450, expiresAt: Date.now() + 3600000, participants: [] },
];

let messages = {}; // roomId -> Message[]

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current rooms to the new client
  socket.emit('update-rooms', rooms);

  socket.on('create-room', (newRoom) => {
    rooms.unshift({ ...newRoom, participants: [] });
    io.emit('update-rooms', rooms);
  });

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (!room.participants.find(p => p.id === user.id)) {
        room.participants.push(user);
        io.emit('update-rooms', rooms);
      }
      // Send message history
      socket.emit('room-history', messages[roomId] || []);
    }
  });

  socket.on('send-message', ({ roomId, message }) => {
    if (!messages[roomId]) messages[roomId] = [];
    const fullMsg = { ...message, timestamp: Date.now() };
    messages[roomId].push(fullMsg);
    
    // Cleanup old messages (10 min)
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    messages[roomId] = messages[roomId].filter(m => m.timestamp > tenMinAgo);

    io.to(roomId).emit('new-message', fullMsg);
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].participants = rooms[roomIndex].participants.filter(p => p.id !== userId);
      
      // Lógica de Efemeridade das Salas: Remover se vazia e ad-hoc
      if (rooms[roomIndex].type === 'adhoc' && rooms[roomIndex].participants.length === 0) {
        rooms.splice(roomIndex, 1);
        delete messages[roomId];
      }
      
      io.emit('update-rooms', rooms);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Ephemeral Backend running on port ${PORT}`);
});
