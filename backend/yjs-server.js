// backend/yjs-server.js

const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const { setupWSConnection } = require('y-websocket/bin/utils');
const { getOrCreateYDoc, closeYDoc } = require('./yjs-persistence-logic');
require('./config/db')();
require('dotenv').config();

const YJS_PORT = process.env.YJS_PORT || 1234;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs WebSocket Server is running');
});

const wss = new WebSocket.Server({ server });

// Map to track active WebSocket connections per roomId for resource cleanup
const roomConnections = new Map();

wss.on('connection', async (ws, req) => {
  // Parse URL: expected format  /<roomId>?token=<jwt>
  const urlObj = new URL(req.url, `http://localhost:${YJS_PORT}`);
  const roomId = urlObj.pathname.startsWith('/')
    ? urlObj.pathname.substring(1)
    : urlObj.pathname;
  const token = urlObj.searchParams.get('token');

  // ── 1. Require a roomId ───────────────────────────────────────────────────
  if (!roomId) {
    console.error('[YjsServer] Connection without roomId — closing.');
    ws.close(1008, 'RoomID is required');
    return;
  }

  // ── 2. Verify JWT ─────────────────────────────────────────────────────────
  if (!token) {
    console.warn(`[YjsServer] Connection to room "${roomId}" without token — closing.`);
    ws.close(1008, 'Authentication required: no token provided.');
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.warn(`[YjsServer] Invalid token for room "${roomId}": ${err.message}`);
    ws.close(1008, 'Authentication failed: invalid or expired token.');
    return;
  }

  const { userId, displayName } = decoded;
  console.log(`[YjsServer] Authenticated user "${displayName}" (${userId}) connecting to room: ${roomId}`);

  // ── 3. Set up Yjs document ────────────────────────────────────────────────
  try {
    const ydoc = await getOrCreateYDoc(roomId);
    setupWSConnection(ws, req, { doc: ydoc });
    console.log(`[YjsServer] "${displayName}" successfully connected to Yjs room: ${roomId}`);

    // Track active connection for garbage collection
    if (!roomConnections.has(roomId)) {
      roomConnections.set(roomId, new Set());
    }
    roomConnections.get(roomId).add(ws);

    // Clean up when client disconnects
    ws.on('close', async () => {
      const conns = roomConnections.get(roomId);
      if (conns) {
        conns.delete(ws);
        console.log(
          `[YjsServer] "${displayName}" disconnected from room: ${roomId}. Remaining: ${conns.size}`
        );

        if (conns.size === 0) {
          roomConnections.delete(roomId);
          console.log(`[YjsServer] Room "${roomId}" empty — performing final save and cleanup.`);
          try {
            await closeYDoc(roomId);
          } catch (closeErr) {
            console.error(`[YjsServer] Error closing room "${roomId}":`, closeErr);
          }
        }
      }
    });
  } catch (error) {
    console.error(`[YjsServer] Error setting up Yjs connection for room "${roomId}":`, error);
    ws.close(1011, 'Internal server error');
  }
});

server.listen(YJS_PORT, '0.0.0.0', () => {
  console.log(`[YjsServer] Yjs WebSocket server listening on ws://localhost:${YJS_PORT}`);
});
