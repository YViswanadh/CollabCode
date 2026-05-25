import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { currentUser, loading, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleCTA = () => {
    if (currentUser) {
      navigate('/workspace');
    } else {
      navigate('/login');
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSubmitted(true);
    setEmailInput('');
    setTimeout(() => setEmailSubmitted(false), 5000);
  };

  // Gorgeous counter-rotating geometric loader while session is being verified
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#050811] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      }`}>
        <div className="flex flex-col items-center gap-6 relative">
          <div className="w-20 h-20 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl border border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-2 rounded-2xl border border-dashed border-indigo-500/20 animate-[spin_6s_linear_infinite_reverse]" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 animate-pulse">
              <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
            </div>
          </div>
          <div className="text-center animate-pulse">
            <h3 className={`text-base font-bold tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Securing Connection
            </h3>
            <p className={`text-xs font-mono mt-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Restoring collaborative workspace…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 animate-page-transition overflow-hidden relative ${
      theme === 'dark'
        ? 'bg-[#050811] text-slate-100'
        : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* ── Technical Grid Mesh Background ── */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-300 [background-size:20px_20px] ${
        theme === 'dark'
          ? 'bg-[radial-gradient(rgba(6,182,212,0.06)_1.5px,transparent_1.5px)]'
          : 'bg-[radial-gradient(rgba(99,102,241,0.05)_1.5px,transparent_1.5px)]'
      }`} />

      {/* ── Outer Pulsing Ambient lights ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 blur-[130px] animate-[pulse_8s_ease-in-out_infinite] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-15 blur-[140px] animate-[pulse_10s_ease-in-out_infinite] pointer-events-none z-0" />

      {/* ── Navigation Header ── */}
      <header className={`sticky top-0 z-45 w-full backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#050811]/75 border-slate-900/80 shadow-cyan-950/5'
          : 'bg-[#ffffff]/75 border-slate-200/80 shadow-slate-100/60'
      }`}>
        <Link to="/" className="flex items-center gap-3 active:scale-98 transition duration-150 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Collab<span className={`transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wider font-mono">REAL-TIME WORKSPACE</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/40'
                : 'bg-slate-100/80 border-slate-200 text-indigo-600 hover:text-indigo-500 hover:bg-slate-200/40 shadow-sm'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {currentUser ? (
            <Link
              to="/workspace"
              className="px-5 py-2.5 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              Go to Workspace
            </Link>
          ) : (
            <Link
              to="/login"
              className={`px-5 py-2.5 text-xs rounded-xl border transition-all duration-150 font-extrabold active:scale-95 cursor-pointer shadow-md ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-800/40 shadow-black/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-slate-200/50'
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* ── Main Hero Section (Stitch Redesign: "Speed of Light") ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-3xl text-center space-y-8">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold tracking-widest font-mono transition-colors duration-150 uppercase ${
            theme === 'dark'
              ? 'bg-cyan-950/30 border-cyan-800/30 text-cyan-400 shadow-inner'
              : 'bg-cyan-50/50 border-cyan-200/60 text-cyan-600 shadow-sm'
          }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            GLACIER UPDATE 2.4 LIVE NOW
          </div>

          <h2 className="text-4xl sm:text-7.5xl font-extrabold tracking-tight leading-[1.03] select-none">
            Code at the <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-550 to-purple-600">Speed of Light</span>
          </h2>

          <p className={`text-sm sm:text-base max-w-2xl mx-auto transition-colors duration-150 font-light leading-relaxed ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            The world's fastest collaborative code editor. Zero latency, real-time presence, and native performance. Built for teams who ship at lightspeed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
            <button
              onClick={handleCTA}
              className={`px-8 py-4 rounded-full font-extrabold text-sm active:scale-95 transition-all duration-200 cursor-pointer shadow-lg tracking-wide ${
                theme === 'dark'
                  ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-white/5'
                  : 'bg-slate-950 text-white hover:bg-slate-900 shadow-slate-950/10'
              }`}
            >
              Start Coding Now
            </button>
            <a
              href="https://github.com/YViswanadh/CollabCode"
              target="_blank"
              rel="noreferrer"
              className={`px-6 py-4 font-extrabold text-sm hover:underline tracking-wide transition duration-150 ${
                theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              View Docs
            </a>
          </div>
        </div>

        {/* ── Mockup / Visual Highlight Component (Stitch Edition) ── */}
        <div className="w-full max-w-4xl mt-16 md:mt-24 z-10 transition-transform duration-500 hover:scale-[1.01]">
          <div className={`border rounded-3xl p-3 shadow-2xl transition-all duration-300 shadow-[0_0_50px_rgba(6,182,212,0.08)] ${
            theme === 'dark'
              ? 'bg-[#0b0f19]/70 border-slate-800/80'
              : 'bg-white/80 border-slate-200/80'
          }`}>
            {/* Mock Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/30 mb-3 px-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-60" />
                {/* Tabs bar */}
                <div className="flex items-center gap-1 ml-6 text-[10px] font-mono">
                  <span className={`px-4 py-1 rounded-t-lg border-t border-l border-r font-bold flex items-center gap-1.5 transition-colors ${
                    theme === 'dark' ? 'bg-[#05080f]/80 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-indigo-600'
                  }`}>
                    <span>index.ts</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </span>
                  <span className="px-3 py-1 text-slate-500">styles.css</span>
                  <span className="px-3 py-1 text-slate-500 font-light">layout.html</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/20 text-emerald-400 border border-emerald-900/35">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Sync Online</span>
              </div>
            </div>

            {/* Mock Editor Canvas with neon custom cursors & Latency metrics */}
            <div className={`p-6 rounded-2xl font-mono text-xs overflow-hidden border transition-colors duration-150 relative ${
              theme === 'dark' ? 'bg-[#05080f] border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
            }`}>
              
              {/* Latency Metrics side card */}
              <div className={`absolute top-6 right-6 p-4 rounded-xl border z-20 backdrop-blur shadow-lg hidden sm:flex flex-col gap-2 max-w-[180px] text-[10px] ${
                theme === 'dark'
                  ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                  : 'bg-white/90 border-slate-200 text-slate-600'
              }`}>
                <span className="font-bold text-[9px] uppercase tracking-wider font-sans text-slate-500">Latency Metrics</span>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>Global Outpost</span>
                    <span className="text-emerald-400 font-bold">0.4ms</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                    <div className="w-[85%] h-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1 border-t border-slate-800/40 pt-1.5">
                  <span>Sync Stream</span>
                  <span className="text-cyan-400 font-bold uppercase text-[8px] border border-cyan-500/20 px-1 rounded bg-cyan-500/5">Stable</span>
                </div>
              </div>

              {/* Collaborative Cursor simulation matching image 4 */}
              <div className="absolute top-[52%] left-[45%] z-20 flex flex-col items-start pointer-events-none">
                <div className="h-4 w-[1.5px] bg-[#9333ea]" />
                <span className="text-[8px] bg-[#9333ea] text-white px-1.5 py-0.5 rounded font-extrabold shadow font-sans mt-0.5 whitespace-nowrap animate-pulse">
                  Alex is typing...
                </span>
              </div>

              {/* Code lines */}
              <div className="flex gap-4">
                <div className="text-slate-600 text-right select-none pr-2 border-r border-slate-800/30">
                  <p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>
                </div>
                <div className="flex-1">
                  <p className="text-purple-400"><span className="text-blue-400">import</span> &#123; <span className="text-yellow-300">Engine</span> &#125; <span className="text-blue-400">from</span> <span className="text-green-400">"@glacier/core"</span>;</p>
                  <br />
                  <p className="text-blue-400">const <span className="text-cyan-400">app</span> = <span className="text-blue-400">new</span> <span className="text-yellow-400">Engine</span>(&#123;</p>
                  <p className="pl-6 text-slate-500">latency: <span className="text-cyan-400">0</span>,</p>
                  <p className="pl-6 text-blue-400">realtime: <span className="text-cyan-400">true</span>,</p>
                  <p className="pl-6 text-slate-500">collaborators: <span className="text-cyan-400">24</span></p>
                  <p className="text-blue-400">&#125;);</p>
                  <br />
                  <p className="text-blue-400">export default <span className="text-cyan-400">app</span>; <span className="text-cyan-400 animate-ping">|</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modern Features Showcase Grid ── */}
        <section className="w-full max-w-6xl mt-28 md:mt-36">
          <div className="text-center space-y-4 mb-20">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4.5xl font-extrabold tracking-tight">
              Designed for Seamless Engineering
            </h3>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto transition-colors duration-150 leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Everything you need for efficient pair programming, coding interview setups, and clean group debugging sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-sm flex gap-6 ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-800/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Ultra-Low Latency</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our custom WebSocket protocol ensures that every keystroke is propagated across the globe in under 50ms. No ghosting, no conflicts.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-sm flex gap-6 ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-800/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Live Presence</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  See cursors, selections, and file navigation in real-time. It's like being in the same room.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-sm flex gap-6 ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-800/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#0b0f19]/35 border border-slate-800/40 flex items-center justify-center text-slate-400 mb-6 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Native Terminal</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  A fully featured terminal with GPU acceleration. Run builds, tests, and scripts without leaving the browser.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-sm flex gap-6 ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-800/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-6 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Git-Ready Workflow</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Native integration with GitHub and GitLab. Resolve merge conflicts visually and commit with AI-assisted messages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Built-With / Tech Stack Showcase ── */}
        <section className="w-full max-w-6xl mt-28 md:mt-36 mb-12">
          <div className="text-center mb-12">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">THE ARCHITECTURE SYSTEM</h4>
            <h3 className="text-2xl font-bold mt-2">Engineered With Leading Standards</h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {['React.js', 'Yjs WebSockets', 'Node.js & Express', 'MongoDB', 'Socket.IO', 'TailwindCSS v4', 'Monaco Editor'].map((tech) => (
              <span key={tech} className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold shadow-sm transition-all duration-150 hover:scale-[1.03] ${
                theme === 'dark'
                  ? 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-650 hover:text-slate-800'
              }`}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ── Call To Action Section (Stitch Redesign: Get Early Access) ── */}
        <section className={`w-full max-w-4xl mt-16 mb-8 border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-tr from-cyan-950/10 to-indigo-950/10 border-slate-800/80 shadow-black/10'
            : 'bg-gradient-to-tr from-cyan-50/20 to-indigo-50/20 border-slate-200/80 shadow-slate-100 shadow-lg'
        }`}>
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
          
          <h3 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight mb-3">Ready to accelerate your workflow?</h3>
          <p className={`text-xs sm:text-sm max-w-md mx-auto mb-8 transition-colors duration-150 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Join 10,000+ teams using CollabCode to build the future of software.
          </p>

          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your work email"
              className={`flex-1 px-5 py-3.5 rounded-full border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-[#050811] border-slate-800 text-white placeholder:text-slate-600'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
              }`}
            />
            <button
              type="submit"
              className={`px-6 py-3.5 rounded-full font-extrabold text-xs sm:text-sm active:scale-95 transition-all duration-250 cursor-pointer shadow-lg tracking-wide shrink-0 ${
                theme === 'dark'
                  ? 'bg-white text-slate-950 hover:bg-slate-100'
                  : 'bg-slate-950 text-white hover:bg-slate-900'
              }`}
            >
              Get Early Access
            </button>
          </form>

          {emailSubmitted && (
            <p className="text-xs text-emerald-400 font-mono font-bold mt-4 animate-pulse">
              Awesome! You've been successfully added to the early access list. 🚀
            </p>
          )}

          <p className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider mt-8 select-none ${
            theme === 'dark' ? 'text-slate-650' : 'text-slate-400'
          }`}>
            NO CREDIT CARD REQUIRED &bull; FREE FOR OPEN SOURCE
          </p>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={`border-t text-center py-6 text-xs font-mono tracking-wide mt-auto transition-colors duration-300 relative z-10 ${
        theme === 'dark' ? 'bg-[#04060a] border-slate-900 text-slate-600' : 'bg-slate-50 border-slate-200/60 text-slate-400 shadow-inner'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-2">
          <span>COLLABCODE &copy; {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">&bull;</span>
          <Link to="/feedback" className="hover:text-cyan-500 transition-colors font-bold">Feedback & Reviews</Link>
        </div>
        <p className="text-[10px] opacity-60">All rights reserved. Styled with premium glassmorphism grids.</p>
      </footer>
    </div>
  );
}
