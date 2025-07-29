
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 3001;

const activeUsers = new Map();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin : [ process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:3000"], // Or your frontend's port
        methods: ["GET", "POST"]
    }
})

const socketToRoomMap = new Map();
const userInfoMap = new Map();

io.on('connection', (socket) => {
  console.log(`A user connected to the main app server: ${socket.id}`);
  // For simplicity, assign a temporary nickname. In a real app, this would come from the client.
  userInfoMap.set(socket.id, { nickname: `User-${socket.id.slice(0, 5)}` });

  socket.on('joinRoom', (roomId, callback) => {
    console.log(`Socket ${socket.id} attempting to join Socket.IO room: ${roomId}`);
    const currentUserInfo = userInfoMap.get(socket.id) || { nickname: `User-${socket.id.slice(0, 5)}` };

    const previousRoom = socketToRoomMap.get(socket.id);
    if (previousRoom && previousRoom !== roomId) {
      socket.leave(previousRoom);
      // Broadcast that the user left the previous Socket.IO room
      // This uses socket.to() which sends to all in room except the sender.
      // However, for a "left" message related to a room switch, io.to() might be more intuitive
      // if the user is considered "gone" from that room's perspective.
      io.to(previousRoom).emit('userLeftAppRoom', {
        userId: socket.id,
        nickname: currentUserInfo.nickname,
        roomId: previousRoom,
        message: `${currentUserInfo.nickname} left the room.`
      });
      console.log(`Socket ${socket.id} left Socket.IO room: ${previousRoom}`);
    }

    socket.join(roomId);
    socketToRoomMap.set(socket.id, roomId);

    console.log(`Socket ${socket.id} (${currentUserInfo.nickname}) successfully joined Socket.IO room: ${roomId}`);
    socket.to(roomId).emit('userJoinedAppRoom', {
      userId: socket.id,
      nickname: currentUserInfo.nickname,
      roomId: roomId,
      message: `${currentUserInfo.nickname} joined the room.`
    });

    if (typeof callback === 'function') {
      // You could also send the list of current users in this Socket.IO room back to the joining client.
      // This would be application-level users, not necessarily Yjs awareness users.
      const usersInRoom = [];
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
      if (socketsInRoom) {
        socketsInRoom.forEach(socketIdInRoom => {
          if (socketIdInRoom !== socket.id) { // Exclude the current user from this list initially
              const userInfo = userInfoMap.get(socketIdInRoom) || { nickname: `User-${socketIdInRoom.slice(0,5)}`};
              usersInRoom.push({ id: socketIdInRoom, nickname: userInfo.nickname });
          }
        });
      }
      callback({
        status: 'ok',
        message: `Successfully joined Socket.IO room: ${roomId}`,
        roomId: roomId,
        // usersInRoom: usersInRoom // Optional: send list of other users in the Socket.IO room
      });
    }
  });

  socket.on('cursorChange', (cursorData) => {
      // Get the current Socket.IO room for this socket
      const currentRoom = socketToRoomMap.get(socket.id);
  
      if (currentRoom) {
        // Construct the payload, including the user ID (socket.id)
        const payload = {
          userId: socket.id,
          nickname: (userInfoMap.get(socket.id) || {}).nickname, // Optional: include nickname
          ...cursorData // e.g., { position: ..., selection: ... }
        };
  
        // Broadcast the 'cursorUpdate' event to all *other* sockets in the 'currentRoom'.
        // socket.to(currentRoom) targets all sockets in the room except the sender.
        socket.to(currentRoom).emit('cursorUpdate', payload);
        // console.log(`Broadcasting 'cursorUpdate' in room ${currentRoom} from ${socket.id}`, payload);
      } else {
        // This case should ideally not happen if users must join a room
        // before sending cursor data.
        console.warn(`Socket ${socket.id} sent 'cursorChange' but is not in a known Socket.IO room.`);
        // Optionally, you could broadcast globally if that's a desired fallback,
        // but per-room is usually what's needed.
        // socket.broadcast.emit('cursorUpdate', payload); // Old global broadcast
      }
    });
  
    // Example handler for client setting their application-level nickname
  socket.on('setAppNickname', (nickname, ack) => {
    const oldNickname = (userInfoMap.get(socket.id) || {}).nickname;
    userInfoMap.set(socket.id, { nickname });
    console.log(`Socket ${socket.id} set app nickname to: ${nickname}`);
    
    // Optionally, notify others in the room about the nickname change
    const currentRoom = socketToRoomMap.get(socket.id);
    if (currentRoom) {
      io.to(currentRoom).emit('userNicknameChanged', {
        userId: socket.id,
        oldNickname: oldNickname,
        newNickname: nickname,
        roomId: currentRoom
      });
    }

    if (typeof ack === 'function') ack({ status: 'ok', nickname });
  });
  
  socket.on('disconnect', () => {
    const disconnectedRoom = socketToRoomMap.get(socket.id);
    const currentUserInfo = userInfoMap.get(socket.id) || { nickname: `User-${socket.id.slice(0, 5)}` };

    if (disconnectedRoom) {
      // Broadcast to all remaining clients in the room that this user has left.
      // io.to(disconnectedRoom) is appropriate here as the socket is already disconnected.
      io.to(disconnectedRoom).emit('userLeftAppRoom', {
        userId: socket.id,
        nickname: currentUserInfo.nickname,
        roomId: disconnectedRoom,
        message: `${currentUserInfo.nickname} left the room.`
      });
      console.log(`User ${socket.id} (${currentUserInfo.nickname}) disconnected from main app server and Socket.IO room: ${disconnectedRoom}`);
      socketToRoomMap.delete(socket.id);
    } else {
      console.log(`User ${socket.id} (${currentUserInfo.nickname}) disconnected from main app server (was not in a specific Socket.IO room).`);
    }
    userInfoMap.delete(socket.id); // Clean up user info
  });
});

app.get('/', ()=>{
  console.log('API is running...')
})


server.listen(PORT, ()=>{
    console.log(`Main application server is running on http://localhost:${PORT}`);
    console.log(`Ensure your Yjs WebSocket server is also running (e.g., on ws://localhost:1234)`);
})




// io.to(roomId).emit('some_event', data): 
// Sends data via some_event to all sockets currently in the roomId, including the original sender if they are in the room.
// socket.to(roomId).emit('some_event', data): 
// Sends data via some_event to all sockets in the roomId except for the socket that is calling this method (the original sender).