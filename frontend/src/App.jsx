import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import io from 'socket.io-client';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import FeedbackPage from './pages/FeedbackPage';
import AdminDashboard from './pages/AdminDashboard';
import EditorComponent from './components/EditorComponent';
import UserListComponent from './components/UserListComponent';
import TerminalDrawer from './components/TerminalDrawer';
import './EditorStyles.css';

const MAIN_APP_SERVER_URL = 'http://localhost:3001';
const YJS_WEBSOCKET_SERVER_URL_BASE = 'ws://localhost:1234';

const PREDEFINED_COLORS = [
  '#00f0ff', '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#ef4444', '#14b8a6', '#06b6d4', '#6366f1',
];

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

// ─── Workspace (the protected collaborative editor) ───────────────────────────
function Workspace() {
  const { currentUser, token, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [connectionStatus, setConnectionStatus] = useState('offline');
  const [yjsConnectionStatus, setYjsConnectionStatus] = useState('disconnected');
  const [activeUsers, setActiveUsers] = useState([]); // remote users only
  const [myClientId, setMyClientId] = useState(null); // local Yjs clientID
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Phase 4 States
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' | 'users' | 'preferences'
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const [editorPreferences, setEditorPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('collabcode_editor_preferences');
      return saved ? JSON.parse(saved) : {
        fontSize: 14,
        wordWrap: 'on',
        tabSize: 4,
        minimapEnabled: true,
        autoClosingBrackets: 'always'
      };
    } catch {
      return {
        fontSize: 14,
        wordWrap: 'on',
        tabSize: 4,
        minimapEnabled: true,
        autoClosingBrackets: 'always'
      };
    }
  });

  const updatePreferences = (updates) => {
    setEditorPreferences(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('collabcode_editor_preferences', JSON.stringify(next));
      return next;
    });
  };

  const [socket, setSocket] = useState(null);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const wsProviderRef = useRef(null);
  const awarenessRef = useRef(null);

  const [roomIdInput, setRoomIdInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (currentRoomId) {
      document.title = `Room: ${currentRoomId} | CollabCode Workspace`;
    } else {
      document.title = 'CollabCode — Real-Time Synchronized Editor';
    }
    return () => {
      document.title = 'CollabCode — Collaborative Editor';
    };
  }, [currentRoomId]);

  // Prevent admin from entering workspace coding rooms
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  // Compiler state variables
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingUser, setExecutingUser] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [terminalTab, setTerminalTab] = useState('output');
  const [stdin, setStdin] = useState('');

  // Assign a consistent color for this session based on userId hash
  const userColor = useRef(
    PREDEFINED_COLORS[
      currentUser.userId.charCodeAt(currentUser.userId.length - 1) % PREDEFINED_COLORS.length
    ]
  ).current;

  // ── Connect to Socket.IO (with JWT in handshake) ──────────────────────────
  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnectionStatus('offline');
      return;
    }

    const s = io(MAIN_APP_SERVER_URL, {
      auth: { token }, // JWT sent on handshake — verified by io.use() middleware
    });
    setSocket(s);

    s.on('connect', () => setConnectionStatus('connected'));
    s.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection error:', err.message);
      setConnectionStatus('offline');
    });
    s.on('disconnect', () => setConnectionStatus('offline'));

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  // ── Emit joinRoom when room changes ───────────────────────────────────────
  useEffect(() => {
    if (!socket || !currentRoomId) return;

    const handleConnect = () => {
      socket.emit('joinRoom', currentRoomId, (res) =>
        console.log('[Socket.IO] joinRoom ack:', res)
      );
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, currentRoomId]);

  // ── Synchronized Compiler Socket Listeners ─────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleExecutionStarted = ({ executingUser: runnerName }) => {
      setExecutingUser(runnerName);
      setIsExecuting(true);
      setIsTerminalOpen(true);
      setTerminalTab('output');
    };

    const handleExecutionCompleted = ({ output }) => {
      setExecutingUser(null);
      setIsExecuting(false);
      setTerminalOutput(output);
      setIsTerminalOpen(true);
      setTerminalTab('output');
    };

    socket.on('codeExecutionStarted', handleExecutionStarted);
    socket.on('codeExecutionCompleted', handleExecutionCompleted);

    return () => {
      socket.off('codeExecutionStarted', handleExecutionStarted);
      socket.off('codeExecutionCompleted', handleExecutionCompleted);
    };
  }, [socket]);

  // Clear messages when leaving/changing room
  useEffect(() => {
    setMessages([]);
  }, [currentRoomId]);

  // ── Text Chat Socket Listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !currentRoomId) return;

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserJoined = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          isSystem: true,
          text: data.message,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const handleUserLeft = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          isSystem: true,
          text: data.message,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userJoinedAppRoom', handleUserJoined);
    socket.on('userLeftAppRoom', handleUserLeft);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userJoinedAppRoom', handleUserJoined);
      socket.off('userLeftAppRoom', handleUserLeft);
    };
  }, [socket, currentRoomId]);

  // Scroll to bottom of chat automatically when a new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!socket || !chatInput.trim()) return;
    socket.emit('sendMessage', chatInput.trim());
    setChatInput('');
  };

  // ── Trigger Synchronized Execution ─────────────────────────────────────────
  const handleRunCode = async () => {
    if (!socket || !currentRoomId) return;

    const code = ytextRef.current ? ytextRef.current.toString() : '';

    // Emit lock to server
    socket.emit('triggerCodeExecution', currentRoomId, async (ack) => {
      if (ack && ack.status === 'error') {
        alert(ack.message);
        return;
      }

      // Lock successfully acquired
      try {
        const response = await fetch(`${MAIN_APP_SERVER_URL}/api/compile/compile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            language: currentLanguage,
            code,
            stdin,
          }),
        });

        if (!response.ok) {
          throw new Error('Code execution engine returned an error.');
        }

        const result = await response.json();

        // Release lock and broadcast result
        socket.emit('codeExecutionFinished', {
          roomId: currentRoomId,
          output: result,
        });
      } catch (error) {
        console.error('[Compiler] Execution failed:', error);
        
        socket.emit('codeExecutionFinished', {
          roomId: currentRoomId,
          output: {
            run: {
              stdout: '',
              stderr: `Execution failed: ${error.message}`,
              code: 1,
              signal: 'SIGKILL',
            },
          },
        });
      }
    });
  };

  // ── Set up Yjs on room change ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentRoomId || !token) {
      if (wsProviderRef.current) wsProviderRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
      setYjsConnectionStatus('disconnected');
      setActiveUsers([]);
      setMyClientId(null);
      return;
    }

    const doc = new Y.Doc();
    ydocRef.current = doc;
    ytextRef.current = doc.getText('shared-code-content');

    // Pass JWT as query param in options.params so y-websocket constructs URL correctly (without mangling token)
    const provider = new WebsocketProvider(
      YJS_WEBSOCKET_SERVER_URL_BASE,
      currentRoomId,
      doc,
      {
        params: { token },
      }
    );
    wsProviderRef.current = provider;

    const awareness = provider.awareness;
    awarenessRef.current = awareness;

    provider.on('status', (event) => {
      setYjsConnectionStatus(event.status);

      if (event.status === 'connected') {
        // Set local awareness with authenticated displayName (not a random nickname)
        awareness.setLocalStateField('user', {
          name: currentUser.displayName,   // ← real authenticated name
          color: userColor,
          userId: currentUser.userId,       // ← MongoDB _id for accountability
        });
        setMyClientId(awareness.clientID);
      }
    });

    awareness.on('change', () => {
      const remoteUsers = [];
      awareness.getStates().forEach((state, clientId) => {
        if (clientId !== awareness.clientID && state.user) {
          remoteUsers.push({
            id: clientId,
            nickname: state.user.name,
            color: state.user.color,
            userId: state.user.userId,
          });
        }
      });
      setActiveUsers(remoteUsers);
    });

    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [currentRoomId, token, currentUser.displayName, currentUser.userId, userColor]);

  // ── Multi-Tab Sidebar Content Helper ───────────────────────────────────────
  const renderSidebarContent = (isMobile = false) => {
    return (
      <div className="flex flex-col h-full">
        {/* Navigation Tabs */}
        <div className={`flex gap-4 sm:gap-6 border-b mb-4 transition-colors duration-150 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          {['chat', 'users', 'preferences'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSidebarTab(tab)}
              className={`pb-2.5 px-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-150 capitalize cursor-pointer ${
                sidebarTab === tab
                  ? 'border-cyan-500 text-cyan-400 font-extrabold'
                  : theme === 'dark'
                    ? 'border-transparent text-slate-500 hover:text-slate-300'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'users' ? 'Collaborators' : tab}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          {sidebarTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between h-full min-h-[350px]">
              {/* Message history */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[380px] min-h-[220px]">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono">
                    <svg className="w-8 h-8 mb-2.5 opacity-40 text-cyan-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-[10px] leading-relaxed">No messages yet in this room. Type below to say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    if (msg.isSystem) {
                      return (
                        <div key={idx} className="text-center my-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono border transition-colors ${
                            theme === 'dark' ? 'bg-slate-950/60 border-slate-900 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    const isMe = msg.userId === currentUser.userId;
                    if (isMe) {
                      return (
                        <div key={idx} className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-slate-500 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] font-bold text-cyan-400">You</span>
                          </div>
                          <div className="max-w-[90%] px-3 py-1.5 rounded-2xl rounded-tr-none bg-gradient-to-tr from-cyan-600 to-blue-600 text-white text-xs shadow-sm leading-relaxed break-words">
                            {msg.text}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-300">{msg.nickname}</span>
                            <span className="text-[8px] text-slate-500 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`max-w-[90%] px-3 py-1.5 rounded-2xl rounded-tl-none text-xs border shadow-sm leading-relaxed break-words ${
                            theme === 'dark'
                              ? 'bg-slate-950 border-slate-800 text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    }
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-1.5">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:ring-cyan-500/40 focus:border-cyan-500/40'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                  }`}
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow shadow-cyan-500/25 active:scale-95 transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <svg className="w-3.5 h-3.5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {sidebarTab === 'users' && (
            <div className="space-y-4">
              {/* Self entry */}
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all duration-150 ${
                theme === 'dark' ? 'bg-cyan-950/20 border-cyan-900/30' : 'bg-cyan-50/30 border-cyan-200/50 shadow-sm'
              }`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white border-2" style={{ backgroundColor: `${userColor}20`, borderColor: userColor }}>
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold truncate transition-colors duration-150 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{currentUser.displayName}</p>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-bold shrink-0">You</span>
                  </div>
                  <p className={`text-[9px] font-mono truncate transition-colors duration-150 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{currentUser.email}</p>
                </div>
              </div>
              <UserListComponent users={activeUsers} myClientId={myClientId} />
            </div>
          )}

          {sidebarTab === 'preferences' && (
            <div className="space-y-4 pt-1">
              <div className={`p-3.5 border rounded-2xl space-y-4 transition-colors duration-150 ${
                theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-200 shadow-sm'
              }`}>
                {/* Font Size slider */}
                <div className="space-y-2 select-none">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Font Size:</span>
                    <span className="text-cyan-400 font-bold">{editorPreferences.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={editorPreferences.fontSize}
                    onChange={(e) => updatePreferences({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-800 accent-cyan-500 cursor-pointer rounded-lg"
                  />
                </div>

                {/* Word Wrap toggle */}
                <div className="flex items-center justify-between py-1 select-none">
                  <span className="text-xs font-mono text-slate-400">Word Wrap:</span>
                  <button
                    onClick={() => updatePreferences({ wordWrap: editorPreferences.wordWrap === 'on' ? 'off' : 'on' })}
                    className={`w-10 h-5.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      editorPreferences.wordWrap === 'on' ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-200 ease-in-out ${
                      editorPreferences.wordWrap === 'on' ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Tab Size selector */}
                <div className="flex items-center justify-between py-1 select-none">
                  <span className="text-xs font-mono text-slate-400">Tab Size:</span>
                  <select
                    value={editorPreferences.tabSize}
                    onChange={(e) => updatePreferences({ tabSize: parseInt(e.target.value) })}
                    className={`text-[11px] font-mono px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-cyan-500/40 cursor-pointer ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {[2, 4, 8].map((size) => (
                      <option key={size} value={size}>{size} Spaces</option>
                    ))}
                  </select>
                </div>

                {/* Auto Close Brackets */}
                <div className="flex items-center justify-between py-1 select-none">
                  <span className="text-xs font-mono text-slate-400">Auto Brackets:</span>
                  <select
                    value={editorPreferences.autoClosingBrackets}
                    onChange={(e) => updatePreferences({ autoClosingBrackets: e.target.value })}
                    className={`text-[11px] font-mono px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-cyan-500/40 cursor-pointer ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="always">Always</option>
                    <option value="never">Never</option>
                    <option value="beforeWhitespace">Whitespace Only</option>
                  </select>
                </div>

                {/* Minimap toggle */}
                <div className="flex items-center justify-between py-1 select-none">
                  <span className="text-xs font-mono text-slate-400">Show Minimap:</span>
                  <button
                    onClick={() => updatePreferences({ minimapEnabled: !editorPreferences.minimapEnabled })}
                    className={`w-10 h-5.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      editorPreferences.minimapEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-200 ease-in-out ${
                      editorPreferences.minimapEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Invite Button at the bottom of the sidebar (matching the mockup design) */}
        <div className="mt-4 pt-4 border-t border-slate-800/20 dark:border-slate-900/40 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Workspace room link copied to clipboard!");
            }}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider font-mono active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-[#ccff00] text-[#050811] hover:bg-[#b8e600] shadow-[#ccff00]/10 border border-[#ccff00]/20'
                : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-indigo-500/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Invite</span>
          </button>
        </div>
      </div>
    );
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const room = roomIdInput.trim();
    if (!room) return;
    setCurrentRoomId(room);
    setRoomIdInput('');
  };

  const handleLeaveRoom = () => setCurrentRoomId(null);

  const handleLogout = () => {
    setCurrentRoomId(null);
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 animate-page-transition relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-[#050811] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
        : 'bg-[#f8fafc] text-slate-800 selection:bg-indigo-500/20 selection:text-indigo-900'
    }`}>
      {/* ── Technical Grid Mesh Background ── */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-300 [background-size:20px_20px] ${
        theme === 'dark'
          ? 'bg-[radial-gradient(rgba(6,182,212,0.06)_1.5px,transparent_1.5px)]'
          : 'bg-[radial-gradient(rgba(99,102,241,0.05)_1.5px,transparent_1.5px)]'
      }`} />

      {/* ── Corner Pulsing Lights ── */}
      <div className="absolute top-[-20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none z-0 animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none z-0 animate-[pulse_8s_ease-in-out_infinite]" />

      {/* ── Header ── */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#050811]/85 border-slate-900/80 shadow-cyan-950/5'
          : 'bg-[#ffffff]/80 border-slate-200/80 shadow-slate-100/60'
      }`}>
        <Link to="/" className="flex items-center gap-3 active:scale-98 transition duration-150 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Collab<span className={`transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wider font-mono">REAL-TIME WORKSPACE v2.0</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Status chips */}
          <div className="hidden sm:flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors duration-150 ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}>
              <span className="text-slate-400 font-medium font-mono uppercase text-[9px] tracking-wider">App:</span>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} />
              <span className={`font-semibold capitalize ${connectionStatus === 'connected' ? 'text-cyan-400' : 'text-slate-500'}`}>{connectionStatus}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors duration-150 ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}>
              <span className="text-slate-400 font-medium font-mono uppercase text-[9px] tracking-wider">Sync:</span>
              <span className={`w-2 h-2 rounded-full ${yjsConnectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
              <span className={`font-semibold capitalize ${yjsConnectionStatus === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`}>{yjsConnectionStatus}</span>
            </div>
          </div>

          {/* Logged-in user pill */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors duration-150 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-slate-100/80 border-slate-200/80 text-slate-700'
          }`}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow" style={{ backgroundColor: userColor }}>
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold">{currentUser.displayName}</span>
          </div>

          {/* Conditional Admin Panel Access badge */}
          {currentUser.role === 'admin' && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-500 text-xs font-bold font-mono transition-all duration-150 hover:bg-amber-500/20 active:scale-95 cursor-pointer shadow-sm shadow-amber-500/5"
              title="Enter Admin Shield Panel"
            >
              <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Shield</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/40'
                : 'bg-slate-100/80 border-slate-200 text-indigo-600 hover:text-indigo-500 hover:bg-slate-200/40'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              // Sun Icon for Light Mode
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              // Moon Icon for Dark Mode
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile sidebar toggle */}
          {currentRoomId && (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`lg:hidden p-2 rounded-xl border transition duration-150 ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          )}

          {/* Logout */}
          <button onClick={handleLogout} className={`p-2 rounded-xl border transition duration-150 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40' 
              : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-500/40 shadow'
          }`} title="Sign out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-2.5 sm:p-4 max-w-[1440px] mx-auto w-full flex flex-col gap-4">

        {/* Mobile status row */}
        <div className={`flex sm:hidden flex-wrap items-center gap-3 px-4 py-2.5 rounded-2xl border text-xs justify-between transition-colors duration-150 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-slate-100/80 border-slate-200/80 text-slate-700 shadow-sm'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">App:</span>
            <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} />
            <span className={connectionStatus === 'connected' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>{connectionStatus}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Sync:</span>
            <span className={`w-1.5 h-1.5 rounded-full ${yjsConnectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
            <span className={yjsConnectionStatus === 'connected' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>{yjsConnectionStatus}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow" style={{ backgroundColor: userColor }}>
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold">{currentUser.displayName}</span>
          </div>
        </div>

        {/* ── Join Room / Workspace ── */}
        {!currentRoomId ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className={`w-full max-w-md border rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${
              theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 shadow-cyan-950/10' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700 pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700 pointer-events-none" />

              <div className="text-center space-y-3 mb-8 relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold tracking-tight transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Join Workspace</h2>
                <p className={`text-sm transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Hey <span className="text-cyan-400 font-semibold">{currentUser.displayName}</span>! Enter a room ID to start collaborating.
                </p>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4 relative">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider font-mono transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Room Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hackathon-2026"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500/30'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-200 active:scale-[0.98]"
                >
                  Enter Workspace
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 min-h-[70vh]">
            {/* Toolbar */}
            <div className={`w-full border rounded-3xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md transition-all duration-300 ${
              theme === 'dark' ? 'bg-[#0b0f19]/45 border-slate-900/80 shadow-xl shadow-black/10' : 'bg-white/75 border-slate-200/80 shadow-slate-200/30 shadow-lg'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors duration-150 ${
                  theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  Room: <span className="text-cyan-400 font-extrabold">{currentRoomId}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-colors duration-150 ${
                  theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow" style={{ backgroundColor: userColor }}>
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{currentUser.displayName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Language selector */}
                <div className="relative w-full sm:w-44">
                  <select
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    className={`w-full appearance-none border text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer transition-all duration-150 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-indigo-500/30'
                    }`}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Synced Run Code Button */}
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all duration-200 active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 ${
                    isExecuting
                      ? 'bg-slate-900 border border-slate-800/80 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/10'
                  }`}
                >
                  {isExecuting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 border-t-transparent animate-spin shrink-0" />
                      <span>{executingUser ? `${executingUser.slice(0, 8)} running…` : 'Running…'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 text-emerald-200 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Run Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/70 text-red-400 hover:bg-red-500/5 text-xs font-bold transition duration-200 w-full sm:w-auto"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Main grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 h-[68vh] min-h-[500px]">

              {/* Editor panel */}
              <div className={`lg:col-span-3 border rounded-3xl p-2 sm:p-2.5 flex flex-col shadow-xl overflow-hidden transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-900/20 border-slate-800/80 shadow-black/10' : 'bg-white border-slate-200/80 shadow-slate-200/30 shadow-lg'
              }`}>
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800/60 mb-2.5 px-1.5 justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-40" />
                    <span className={`text-[11px] font-mono pl-2 capitalize transition-colors duration-150 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{currentLanguage} workspace</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                      className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border transition-all duration-150 cursor-pointer ${
                        isTerminalOpen
                          ? 'text-cyan-400 bg-cyan-950/20 border-cyan-800'
                          : theme === 'dark'
                            ? 'text-slate-400 bg-slate-950/40 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                            : 'text-slate-500 bg-slate-50 border-slate-200 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{isTerminalOpen ? 'Hide Console' : 'Show Console'}</span>
                    </button>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/30 px-2 py-1 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Syncing
                    </div>
                  </div>
                </div>

                <div className={`flex-1 rounded-2xl overflow-hidden border mb-3 transition-colors duration-150 ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}>
                  {ytextRef.current && awarenessRef.current ? (
                    <EditorComponent
                      yText={ytextRef.current}
                      yAwareness={awarenessRef.current}
                      language={currentLanguage}
                      theme={theme}
                      fontSize={editorPreferences.fontSize}
                      wordWrap={editorPreferences.wordWrap}
                      tabSize={editorPreferences.tabSize}
                      minimapEnabled={editorPreferences.minimapEnabled}
                      autoClosingBrackets={editorPreferences.autoClosingBrackets}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-mono animate-pulse">
                      Initializing shared editor instance…
                    </div>
                  )}
                </div>

                {/* Collapsible synched Terminal drawer */}
                <TerminalDrawer
                  isOpen={isTerminalOpen}
                  onClose={() => setIsTerminalOpen(false)}
                  isExecuting={isExecuting}
                  executingUser={executingUser}
                  output={terminalOutput}
                  stdin={stdin}
                  setStdin={setStdin}
                  activeTab={terminalTab}
                  setActiveTab={setTerminalTab}
                  language={currentLanguage}
                />
              </div>

              {/* Desktop tabbed utility sidebar */}
              <div className={`hidden lg:block lg:col-span-1 border rounded-3xl p-4 overflow-y-auto shadow-xl transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#0b0f19]/35 border-slate-900/80 shadow-black/10' : 'bg-white/75 border-slate-200/80 shadow-slate-200/30 shadow-lg'
              }`}>
                {renderSidebarContent(false)}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile sidebar drawer */}
      {isSidebarOpen && currentRoomId && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-[#04060b]/60 backdrop-blur-sm animate-fade-in" />
          <div className={`relative w-80 max-w-full p-6 flex flex-col gap-4 shadow-2xl h-full border-l transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setIsSidebarOpen(false)} className={`p-1.5 rounded-xl border transition-colors duration-150 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderSidebarContent(true)}
            </div>
          </div>
        </div>
      )}

      <footer className={`mt-auto border-t text-center py-4 text-xs font-mono tracking-wide transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#04060a] border-slate-900 text-slate-600' : 'bg-slate-50 border-slate-200/60 text-slate-400 shadow-sm'
      }`}>
        COLLABCODE WORKSPACE &copy; {new Date().getFullYear()} &bull; ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}

// ─── App root: routing ────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}