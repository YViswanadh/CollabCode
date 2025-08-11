// frontend/src/App.js (or App.jsx)

import React, { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import io from 'socket.io-client'; // For the main application server connection

import EditorComponent from './components/EditorComponent';
import UserListComponent from './components/UserListComponent';
import './App.css';

// Main application server URL (for Socket.IO connection, NOT the Yjs server)
const MAIN_APP_SERVER_URL = 'http://localhost:3001'; 

// Yjs WebSocket server URL and default room name (will be made dynamic)
const YJS_WEBSOCKET_SERVER_URL_BASE = 'ws://localhost:1234'; 
// const YJS_DEFAULT_ROOM_NAME = 'collaborative-code-editor-room'; // Will be replaced by currentRoomId

// const INITIAL_EDITOR_CODE_YJS = `// Welcome! Please join a room to start collaborating.\n`;

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [yjsConnectionStatus, setYjsConnectionStatus] = useState('Yjs: Not Connected');
  const [activeUsers, setActiveUsers] = useState([]);
  const [myUserId, setMyUserId] = useState(null); // For Yjs awareness clientID

  // --- Main Application Socket.IO Ref ---
  const mainAppSocketRef = useRef(null);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const wsProviderRef = useRef(null);
  const awarenessRef = useRef(null);

  // --- Room Management State ---
  const [roomIdInput, setRoomIdInput] = useState(''); // For the room input field
  const [currentRoomId, setCurrentRoomId] = useState(null); // ID of the currently joined room
  const [isJoiningRoom, setIsJoiningRoom] = useState(false); // For loading/disabled state
  const [roomJoinError, setRoomJoinError] = useState(''); // To display errors from room join attempts

  // Effect for main application Socket.IO connection
  useEffect(() => {
    const socket = io(MAIN_APP_SERVER_URL);
    mainAppSocketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to main app server with socket ID:', socket.id);
      setConnectionStatus(`App Server: Connected (${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from main app server:', reason);
      setConnectionStatus('App Server: Disconnected');
    });
    
    // Example listener for room join/leave notifications from main app server
    // These would be defined based on events emitted in backend/server.js Task 9.5
    socket.on('userJoinedAppRoom', (data) => {
      console.log('App.js: Event "userJoinedAppRoom"', data);
    });

    socket.on('userLeftAppRoom', (data) => {
      console.log('App.js: Event "userLeftAppRoom"', data);
    });

    return () => {
      console.log('Cleaning up main app socket connection.');
      socket.disconnect();
      mainAppSocketRef.current = null;
    };
  }, []); // Runs once on component mount

  // Effect for Yjs Initialization (will be adapted to use currentRoomId)
  useEffect(() => {
    // If there's no currentRoomId, don't initialize Yjs or clean up existing.
    if (!currentRoomId) {
      if (wsProviderRef.current) {
        console.log('No current room, destroying existing Yjs provider and doc.');
        wsProviderRef.current.destroy(); // Disconnects from the Yjs server
        wsProviderRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy(); // Destroys the local Y.Doc instance
        ydocRef.current = null;
      }
      ytextRef.current = null;       // Clear Y.Text ref
      awarenessRef.current = null; // Clear awareness ref
      setYjsConnectionStatus('Yjs: Not Connected (No Room)');
      setActiveUsers([]);
      return; // Exit if no room is selected
    }

    console.log(`Initializing Yjs for room: ${currentRoomId}`);
    const doc = new Y.Doc();
    ydocRef.current = doc;
    const text = doc.getText('shared-code-content');
    ytextRef.current = text;

    const YJS_ROOM_SPECIFIC_URL = `${YJS_WEBSOCKET_SERVER_URL_BASE}/${currentRoomId}`;

    const provider = new WebsocketProvider(
      YJS_ROOM_SPECIFIC_URL,
      currentRoomId,
      doc
    );
    wsProviderRef.current = provider;

    const awarenessInstance = provider.awareness;
    awarenessRef.current = awarenessInstance;

    provider.on('status', event => {
      setYjsConnectionStatus(`Yjs (${currentRoomId}): ${event.status}`);
      if (event.status === 'connected') {
        if (text && text.length === 0) {
          text.insert(0, `// Welcome to Room: ${currentRoomId}\n// Start collaborating!\n`);
        }

        const currentNickname = `User_${Math.random().toString(36).slice(2, 7)}`;
        awarenessInstance.setLocalStateField('user', {
          name: currentNickname,
          color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
        });
        setMyUserId(awarenessInstance.clientID.toString());
      }else if (event.status === 'disconnected') {
        console.warn(`Yjs disconnected from room ${currentRoomId}`);
      }
    });

    text.observe(event => console.log(`Y.Text content updated in room ${currentRoomId}:`));
    awarenessInstance.on('change', changes => {
      const remoteUsers = [];
      awarenessInstance.getStates().forEach((state, clientID) => {
        if (clientID !== awarenessInstance.clientID && state.user) {
          remoteUsers.push({ id: clientID.toString(), nickname: state.user.name, color: state.user.color });
        }
      });
      setActiveUsers(remoteUsers);
    });

    

    return () => {
      console.log(`Cleaning up Yjs for room ${currentRoomId}...`);
      // if (text && typeof text.unobserve === 'function') text.unobserve();
      // if (awarenessInstance && typeof awarenessInstance.off === 'function') awarenessInstance.off('change' );
      if (provider) provider.destroy();
      if (doc) doc.destroy();
      ydocRef.current = null; 
      ytextRef.current = null; 
      wsProviderRef.current = null; 
      awarenessRef.current = null;
    };
  }, [currentRoomId]); // Re-run this effect when currentRoomId changes

  // --- Room UI Event Handlers ---
  const handleRoomIdInputChange = (event) => {
    setRoomIdInput(event.target.value);
    setRoomJoinError(''); // Clear previous errors on new input
  };

  const handleJoinRoomSubmit = (event) => {
    event.preventDefault();
    const targetRoomId = roomIdInput.trim();

    if (!targetRoomId) {
      setRoomJoinError('Room ID cannot be empty.');
      return;
    }
    if (!mainAppSocketRef.current || !mainAppSocketRef.current.connected) {
      setRoomJoinError('Not connected to the application server. Please wait.');
      return;
    }

    // If already in the target room, do nothing.
    if (currentRoomId === targetRoomId) {
      console.log(`Already in room: ${targetRoomId}`);
      setRoomIdInput(''); // Clear input
      return;
    }

    console.log(`Attempting to join Socket.IO room: ${targetRoomId}`);
    setIsJoiningRoom(true);
    setRoomJoinError('');

    // Emit 'joinRoom' to the main application server (Express/Socket.IO)
    mainAppSocketRef.current.emit('joinRoom', targetRoomId, (response) => {
      setIsJoiningRoom(false); // Reset loading state regardless of outcome

      if (response && response.status === 'ok') {
        console.log(`Successfully joined Socket.IO room: ${response.roomId}. Response:`, response);
      
        if (currentRoomId !== response.roomId) { // Only if it's a different room
            setCurrentRoomId(null); 
            setTimeout(() => {
                setCurrentRoomId(response.roomId);
            }, 0);
        }

      } else {
        const errorMessage = response && response.message ? response.message : 'Failed to join room. Unknown error.';
        console.error('Failed to join Socket.IO room:', errorMessage, response);
        setRoomJoinError(errorMessage);
      }
    });
  };

  const handleLeaveRoom = () => {
    if (mainAppSocketRef.current && currentRoomId) {
        // In a full implementation, you might emit a 'leaveRoom' event to the backend Socket.IO
        // mainAppSocketRef.current.emit('leaveRoom', currentRoomId, (response) => { ... });
        // The backend would then use socket.leave(currentRoomId)
        console.log(`UI: Leaving room ${currentRoomId}. Backend 'leaveRoom' emit not yet implemented.`);
    }
    setCurrentRoomId(null); // This will trigger Yjs cleanup due to useEffect dependency
    setRoomIdInput(''); // Clear input field
    setRoomJoinError('');
    console.log('Left room, currentRoomId set to null.');
  };

  const currentAwarenessNickname = awarenessRef.current?.getLocalState()?.user?.name || "Not Set (Yjs)";

  return (
    <div className="App">
      <header className="app-header">
        <h1>Real-time Collaborative Code Editor</h1>
        <div className="connection-statuses">
          <p><strong>App Server:</strong> {connectionStatus}</p>
          <p><strong>Yjs Status:</strong> {yjsConnectionStatus}</p>
          <p><strong>My Yjs Nickname:</strong> {currentAwarenessNickname}</p>
        </div>
      </header>


      <div className="room-selection-container">
        {!currentRoomId ? (
          <form onSubmit={handleJoinRoomSubmit}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomIdInput}
              onChange={handleRoomIdInputChange}
              disabled={isJoiningRoom}
            />
            <button type="submit" disabled={isJoiningRoom || !mainAppSocketRef.current?.connected}>
              {isJoiningRoom ? 'Joining...' : 'Join Room'}
            </button>
            {roomJoinError && <p className="error-message">{roomJoinError}</p>}
          </form>
        ) : (
          <div className="current-room-info">
            <p>Currently in Room: <strong>{currentRoomId}</strong></p>
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        )}
      </div>

      {currentRoomId && ytextRef.current && awarenessRef.current ? ( // Ensure Yjs refs are ready before rendering editor
        <div className="editor-and-users-container">
          <div className="main-content">
            <EditorComponent
              yText={ytextRef.current}
              yAwareness={awarenessRef.current}
            />
          </div>
          <aside className="sidebar">
            <h4>Users in Room (Yjs Awareness)</h4>
            <UserListComponent users={activeUsers} />
          </aside>
        </div>
      ) : (
        <div className="no-room-message">
          {!currentRoomId && <h2>Please enter a Room ID and click "Join Room" to start collaborating.</h2>}
          {currentRoomId && !ytextRef.current && <p>Connecting to Yjs room...</p>}
        </div>
      )}
    </div>
  )
}

export default App;