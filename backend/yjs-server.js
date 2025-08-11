// backend/yjs-server.js

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs'); // Yjs is a peer dependency of y-websocket
const { setupWSConnection } = require('y-websocket/bin/utils'); // Correct path for setupWSConnection
const { getOrCreateYDoc, closeYDoc , activeYDocs } = require('./yjs-persistence-logic');
require('./config/db')();

const YJS_PORT = process.env.YJS_PORT || 1234;


const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket Server is running');
});


const wss = new WebSocket.Server({ server });

wss.on('connection',async (ws, req) => {
  const roomId = req.url.startsWith('/') ? req.url.substring(1) : req.url;

  if (!roomId) {
    console.error('[YjsServer] Connection attempt without roomId. Closing connection.');
    ws.close(1008, 'RoomID is required'); // 1008: Policy Violation]
    closeYDoc(roomId);
    return;
  }
  console.log(`[YjsServer] Client attempting to connect to Yjs room: ${roomId}`);

  try {
    const ydoc = await getOrCreateYDoc(roomId);
    setupWSConnection(ws, req, { doc: ydoc }); 
    console.log(`[YjsServer] Client ${req.socket.remoteAddress} successfully connected to Yjs room: ${roomId}`);
  } catch (error) {
    console.error(`[YjsServer] Error setting up Yjs connection for room ${roomId}:`, error);
    ws.close(1011, 'Internal server error'); // 1011: Internal Error
  }
});

server.listen(YJS_PORT, '0.0.0.0',  () => {
  console.log(`Yjs WebSocket server listening on ws://localhost:${YJS_PORT}`);
});
