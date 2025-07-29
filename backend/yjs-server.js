// backend/yjs-server.js

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs'); // Yjs is a peer dependency of y-websocket
const { setupWSConnection } = require('y-websocket/bin/utils'); // Correct path for setupWSConnection

const YJS_PORT = process.env.YJS_PORT || 1234;


const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket Server is running');
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log(require('y-websocket'));
  console.log(`New Yjs connection: ${req.url}`);
  setupWSConnection(ws, req);
});

server.listen(YJS_PORT, '0.0.0.0',  () => {
  console.log(`Yjs WebSocket server listening on ws://localhost:${YJS_PORT}`);
});


