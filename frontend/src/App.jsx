import React, { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import io from 'socket.io-client';

import EditorComponent from './components/EditorComponent';
import UserListComponent from './components/UserListComponent';
import './App.css';

const MAIN_APP_SERVER_URL = 'http://localhost:3001';
const YJS_WEBSOCKET_SERVER_URL_BASE = 'ws://localhost:1234';


function App() {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [yjsConnectionStatus, setYjsConnectionStatus] = useState('Yjs: Not Connected');
  const [activeUsers, setActiveUsers] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');

  const mainAppSocketRef = useRef(null);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const wsProviderRef = useRef(null);
  const awarenessRef = useRef(null);

  const [roomIdInput, setRoomIdInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomJoinError, setRoomJoinError] = useState('');

  useEffect(() => {
    const socket = io(MAIN_APP_SERVER_URL);
    mainAppSocketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus(`Connected (${socket.id})`);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!currentRoomId) {
      if (wsProviderRef.current) wsProviderRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();

      setYjsConnectionStatus('Yjs: Not Connected');
      setActiveUsers([]);
      return;
    }

    const doc = new Y.Doc();
    ydocRef.current = doc;

    const text = doc.getText('shared-code-content');
    ytextRef.current = text;

    const provider = new WebsocketProvider(
      `${YJS_WEBSOCKET_SERVER_URL_BASE}/${currentRoomId}`,
      currentRoomId,
      doc
    );

    wsProviderRef.current = provider;
    const awareness = provider.awareness;
    awarenessRef.current = awareness;

    provider.on('status', (event) => {
      setYjsConnectionStatus(event.status);

      if (event.status === 'connected') {
        const nickname = `User_${Math.random().toString(36).slice(2, 7)}`;
        awareness.setLocalStateField('user', {
          name: nickname,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        });
        setMyUserId(awareness.clientID.toString());
      }
    });

    awareness.on('change', () => {
      const users = [];
      awareness.getStates().forEach((state, id) => {
        if (id !== awareness.clientID && state.user) {
          users.push({
            id,
            nickname: state.user.name,
            color: state.user.color
          });
        }
      });
      setActiveUsers(users);
    });

    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [currentRoomId]);

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();

    const room = roomIdInput.trim();
    if (!room) return;

    setCurrentRoomId(room);
    setRoomIdInput('');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
  };

  const nickname = awarenessRef.current?.getLocalState()?.user?.name || "Not Set";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* 🔹 Navbar */}
      <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
        <h1 className="text-lg font-semibold">
          Collaborative Code Editor
        </h1>
      </div>

      <div className="p-4 max-w-7xl mx-auto w-full flex-1">

        {/* 🔹 Room Section */}
        <div className="bg-slate-800 p-4 rounded-lg shadow mb-4">
          {!currentRoomId ? (
            <form
              onSubmit={handleJoinRoomSubmit}
              className="flex gap-2 flex-col sm:flex-row"
            >
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">
                Join Room
              </button>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <p>
                Room: <span className="text-blue-400 font-semibold">{currentRoomId}</span>
              </p>
              <button
                onClick={handleLeaveRoom}
                className="border border-red-500 text-red-400 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white"
              >
                Leave
              </button>
            </div>
          )}
        </div>

        {/* 🔹 Status */}
        <div className="bg-slate-800 p-4 rounded-lg mb-4 text-sm space-y-1">
          <p>
            App: <span className={connectionStatus.includes('Connected') ? 'text-green-400' : 'text-red-400'}>
              {connectionStatus}
            </span>
          </p>

          <p>
            Yjs: <span className={yjsConnectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
              {yjsConnectionStatus}
            </span>
          </p>

          <p>Nickname: {nickname}</p>
        </div>

        {/* 🔹 Main Layout */}
        {currentRoomId && ytextRef.current && awarenessRef.current ? (
          <div className="flex flex-col md:flex-row gap-4 h-[70vh]">

            {/* Editor */}
            <div className="flex-1 bg-slate-800 rounded-lg p-2">
              <EditorComponent
                yText={ytextRef.current}
                yAwareness={awarenessRef.current}
              />
            </div>

            {/* Users */}
            <div className="w-full md:w-72 bg-slate-800 rounded-lg p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-3">Active Users</h2>
              <UserListComponent users={activeUsers} />
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-400 mt-10">
            Enter a room to start collaborating
          </div>
        )}

      </div>
    </div>
  );
}

export default App;