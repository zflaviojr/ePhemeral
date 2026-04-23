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
  { id: 'fixed-1', name: 'Starbucks Central', type: 'fixed', distance: 150, isVerified: true, isOpen: true, participants: [], createdBy: 'Sistema' },
];

let messages = {}; // roomId -> Message[]

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('update-rooms', rooms);

  socket.on('create-room', (newRoom) => {
    rooms.unshift({ ...newRoom, participants: [] });
    io.emit('update-rooms', rooms);
  });

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    socket.userId = user.id; // Map userId to this socket
    
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      if (!room.participants.find(p => p.id === user.id)) {
        room.participants.push(user);
        io.emit('update-rooms', rooms);
      }
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
      
      if (rooms[roomIndex].type === 'adhoc' && rooms[roomIndex].participants.length === 0) {
        rooms.splice(roomIndex, 1);
        delete messages[roomId];
      }
      
      io.emit('update-rooms', rooms);
    }
  });

  socket.on('disconnect', () => {
    const userId = socket.userId;
    if (!userId) return;
    
    console.log('User disconnected:', userId);
    
    let changed = false;
    // Remove user from all rooms they were in
    rooms = rooms.map(room => {
      if (room.participants.find(p => p.id === userId)) {
        changed = true;
        return {
          ...room,
          participants: room.participants.filter(p => p.id !== userId)
        };
      }
      return room;
    });

    // Cleanup empty adhoc rooms
    const initialCount = rooms.length;
    rooms = rooms.filter(room => {
      if (room.type === 'adhoc' && room.participants.length === 0) {
        delete messages[room.id];
        return false;
      }
      return true;
    });

    if (changed || rooms.length !== initialCount) {
      io.emit('update-rooms', rooms);
    }
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Ephemeral Backend running on port ${PORT}`);
});
