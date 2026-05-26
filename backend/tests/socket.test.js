// backend/tests/socket.test.js

// Mock database connection config to bypass actual mongo database loading
jest.mock('../config/db', () => jest.fn());

const http = require('http');
const jwt = require('jsonwebtoken');
const Client = require('socket.io-client');
const { server, io } = require('../server');

describe('Socket.IO WebSocket Event Handlers & Room Isolation Tests', () => {
  let ioServer;
  let port;
  let tokenUserA, tokenUserB, tokenUserC;
  let clientSocketA, clientSocketB, clientSocketC;

  beforeAll((done) => {
    // Generate valid test JWT tokens
    process.env.JWT_SECRET = 'test-secret-key';
    
    tokenUserA = jwt.sign(
      { userId: 'user-a-123', displayName: 'Alice', email: 'alice@collab.com' },
      process.env.JWT_SECRET
    );
    tokenUserB = jwt.sign(
      { userId: 'user-b-456', displayName: 'Bob', email: 'bob@collab.com' },
      process.env.JWT_SECRET
    );
    tokenUserC = jwt.sign(
      { userId: 'user-c-789', displayName: 'Charlie', email: 'charlie@collab.com' },
      process.env.JWT_SECRET
    );

    // Bind HTTP server to a random ephemeral port for testing
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  afterEach(() => {
    // Cleanup active client sockets
    if (clientSocketA && clientSocketA.connected) clientSocketA.disconnect();
    if (clientSocketB && clientSocketB.connected) clientSocketB.disconnect();
    if (clientSocketC && clientSocketC.connected) clientSocketC.disconnect();
  });

  test('03: should reject Socket.IO connections without a token', (done) => {
    const socket = new Client(`http://localhost:${port}`);
    socket.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication required: no token provided.');
      socket.disconnect();
      done();
    });
  });

  test('03: should successfully authenticate and connect client with valid token', (done) => {
    clientSocketA = new Client(`http://localhost:${port}`, {
      auth: { token: tokenUserA }
    });
    
    clientSocketA.on('connect', () => {
      expect(clientSocketA.connected).toBe(true);
      done();
    });
  });

  test('05: should join a room and notify other collaborators inside the same room', (done) => {
    const roomId = 'room-1';
    
    clientSocketA = new Client(`http://localhost:${port}`, {
      auth: { token: tokenUserA }
    });
    
    clientSocketA.on('connect', () => {
      // Connect client B and join the same room
      clientSocketB = new Client(`http://localhost:${port}`, {
        auth: { token: tokenUserB }
      });
      
      clientSocketB.on('connect', () => {
        clientSocketA.on('userJoinedAppRoom', (data) => {
          expect(data.nickname).toBe('Bob');
          expect(data.roomId).toBe(roomId);
          expect(data.message).toContain('joined the room');
          done();
        });

        // Client A joins first
        clientSocketA.emit('joinRoom', roomId, (ackA) => {
          expect(ackA.status).toBe('ok');
          
          // Client B joins next
          clientSocketB.emit('joinRoom', roomId, (ackB) => {
            expect(ackB.status).toBe('ok');
          });
        });
      });
    });
  });

  test('05: should guarantee strict room isolation (room A messages do not bleed to room B)', (done) => {
    clientSocketA = new Client(`http://localhost:${port}`, { auth: { token: tokenUserA } });
    clientSocketB = new Client(`http://localhost:${port}`, { auth: { token: tokenUserB } });
    clientSocketC = new Client(`http://localhost:${port}`, { auth: { token: tokenUserC } });

    let countMsgReceived = 0;

    // Client A and B are in 'room-alpha'
    // Client C is in 'room-beta'
    clientSocketA.on('connect', () => {
      clientSocketB.on('connect', () => {
        clientSocketC.on('connect', () => {
          
          clientSocketA.emit('joinRoom', 'room-alpha', () => {
            clientSocketB.emit('joinRoom', 'room-alpha', () => {
              clientSocketC.emit('joinRoom', 'room-beta', () => {
                
                // Client B and Client C listen to messages
                clientSocketB.on('receiveMessage', (msg) => {
                  expect(msg.text).toBe('Hello alpha room');
                  expect(msg.nickname).toBe('Alice');
                  countMsgReceived++;
                  
                  // Give C brief timeout to ensure it received nothing, then finish test
                  setTimeout(() => {
                    expect(countMsgReceived).toBe(1);
                    done();
                  }, 100);
                });

                clientSocketC.on('receiveMessage', (msg) => {
                  // Should NEVER receive this as C is in room-beta
                  fail('Client C in room-beta should not receive messages from room-alpha!');
                });

                // Client A sends a message in room-alpha
                clientSocketA.emit('sendMessage', 'Hello alpha room');
              });
            });
          });
          
        });
      });
    });
  });

  test('03: should synchronize and broadcast cursor movements to other room members', (done) => {
    clientSocketA = new Client(`http://localhost:${port}`, { auth: { token: tokenUserA } });
    clientSocketB = new Client(`http://localhost:${port}`, { auth: { token: tokenUserB } });

    clientSocketA.on('connect', () => {
      clientSocketB.on('connect', () => {
        clientSocketA.emit('joinRoom', 'cursor-room', () => {
          clientSocketB.emit('joinRoom', 'cursor-room', () => {
            
            clientSocketB.on('cursorUpdate', (cursor) => {
              expect(cursor.userId).toBe('user-a-123');
              expect(cursor.nickname).toBe('Alice');
              expect(cursor.lineNumber).toBe(10);
              expect(cursor.columnNumber).toBe(15);
              done();
            });

            clientSocketA.emit('cursorChange', { lineNumber: 10, columnNumber: 15 });
          });
        });
      });
    });
  });

  test('03: should lock room compiler execution and broadcast started/completed events', (done) => {
    clientSocketA = new Client(`http://localhost:${port}`, { auth: { token: tokenUserA } });
    clientSocketB = new Client(`http://localhost:${port}`, { auth: { token: tokenUserB } });
    const roomId = 'compile-lock-room';

    clientSocketA.on('connect', () => {
      clientSocketB.on('connect', () => {
        clientSocketA.emit('joinRoom', roomId, () => {
          clientSocketB.emit('joinRoom', roomId, () => {
            
            clientSocketB.on('codeExecutionStarted', (lockData) => {
              expect(lockData.executingUser).toBe('Alice');
              
              // Client B tries to trigger code run concurrently; must be rejected by server
              clientSocketB.emit('triggerCodeExecution', roomId, (ack) => {
                expect(ack.status).toBe('error');
                expect(ack.message).toContain('locked');

                // Client A finishes execution, broadcasts finished output
                clientSocketA.emit('codeExecutionFinished', {
                  roomId,
                  output: { run: { stdout: 'Mock Output', stderr: '', code: 0 } }
                });
              });
            });

            clientSocketB.on('codeExecutionCompleted', (completedData) => {
              expect(completedData.output.run.stdout).toBe('Mock Output');
              done();
            });

            // Client A starts code execution
            clientSocketA.emit('triggerCodeExecution', roomId, (ack) => {
              expect(ack.status).toBe('ok');
            });
          });
        });
      });
    });
  });
});
