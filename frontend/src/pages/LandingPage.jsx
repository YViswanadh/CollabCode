import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { currentUser, loading, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (currentUser) {
      navigate('/workspace');
    } else {
      navigate('/login');
    }
  };

  // Gorgeous counter-rotating geometric loader while session is being verified
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080c14] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
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
        ? 'bg-[#080c14] text-slate-100'
        : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* ── Technical Grid Mesh Background ── */}
      <div className={`absolute inset-0 bg-[radial-gradient(#3b82f6_1.2px,transparent_1.2px)] [background-size:32px_32px] pointer-events-none z-0 transition-opacity duration-300 ${
        theme === 'dark' ? 'opacity-[0.06]' : 'opacity-[0.03]'
      }`} />

      {/* ── Outer Pulsing Ambient lights ── */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 blur-[130px] animate-[pulse_8s_ease-in-out_infinite] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-15 blur-[140px] animate-[pulse_10s_ease-in-out_infinite] pointer-events-none z-0" />

      {/* ── Navigation Header ── */}
      <header className={`sticky top-0 z-45 w-full backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#080c14]/75 border-slate-808/80 shadow-cyan-950/5'
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
                ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-805/40'
                : 'bg-slate-100/80 border-slate-200 text-indigo-600 hover:text-indigo-505 hover:bg-slate-200/40 shadow-sm'
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
              className="px-5 py-2.5 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-650 hover:from-cyan-405 hover:to-indigo-555 text-white font-extrabold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              Go to Workspace
            </Link>
          ) : (
            <Link
              to="/login"
              className={`px-5 py-2.5 text-xs rounded-xl border transition-all duration-150 font-extrabold active:scale-95 cursor-pointer shadow-md ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-800/40 shadow-black/10'
                  : 'bg-white border-slate-205 text-slate-700 hover:text-slate-900 hover:border-slate-350 shadow-slate-200/50'
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* ── Main Hero Section ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-3xl text-center space-y-8">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest font-mono transition-colors duration-150 ${
            theme === 'dark'
              ? 'bg-cyan-950/20 border-cyan-800/30 text-cyan-400 shadow-inner'
              : 'bg-cyan-50 border-cyan-200/60 text-cyan-600 shadow-sm'
          }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            REAL-TIME CODE SYNCHRONIZATION
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
            Empower Your Code Collaborations in Real-Time
          </h2>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto transition-colors duration-150 font-light leading-relaxed ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Write, compile, and debug code instantly in multi-user pair programming environments. Experience smooth pixel-perfect sync and secure shared compiler drawer terminals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            {currentUser ? (
              <Link
                to="/workspace"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/40 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                Enter Code Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/40 active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  Create Account (Free)
                </Link>
                <Link
                  to="/login"
                  className={`px-8 py-4 rounded-2xl border transition-all duration-150 font-extrabold active:scale-95 cursor-pointer text-sm shadow-md ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-350 hover:text-white hover:border-slate-700 hover:bg-slate-900/40 shadow-black/10'
                      : 'bg-white border-slate-205 text-slate-700 hover:text-slate-900 hover:border-slate-350 shadow-slate-100'
                  }`}
                >
                  Login to Existing Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Mockup / Visual Highlight Component (Ultra-Premium IDE) ── */}
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
                  <span className={`px-3 py-1 rounded-t-lg border-t border-l border-r font-bold flex items-center gap-1.5 transition-colors ${
                    theme === 'dark' ? 'bg-[#05080f]/80 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-indigo-650'
                  }`}>
                    <span>main.cpp</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </span>
                  <span className="px-3 py-1 text-slate-500">Document.js</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/20 text-emerald-400 border border-emerald-900/35">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Sync Online</span>
              </div>
            </div>

            {/* Mock Editor Canvas with neon custom cursors */}
            <div className={`p-6 rounded-2xl font-mono text-xs overflow-hidden border transition-colors duration-150 relative ${
              theme === 'dark' ? 'bg-[#05080f] border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
            }`}>
              
              {/* Remote Cursor simulation 1 */}
              <div className="absolute top-[28%] left-[34%] z-20 flex flex-col items-start pointer-events-none animate-pulse">
                <div className="h-4 w-[1.5px] bg-cyan-400" />
                <span className="text-[8px] bg-cyan-400 text-slate-950 px-1 py-0.5 rounded font-extrabold shadow font-mono">Alex</span>
              </div>

              {/* Remote Cursor simulation 2 */}
              <div className="absolute top-[62%] left-[45%] z-20 flex flex-col items-start pointer-events-none animate-pulse">
                <div className="h-4 w-[1.5px] bg-pink-500" />
                <span className="text-[8px] bg-pink-500 text-white px-1 py-0.5 rounded font-extrabold shadow font-mono">Sophia</span>
              </div>

              {/* Code lines */}
              <div className="flex gap-4">
                <div className="text-slate-600 text-right select-none pr-2 border-r border-slate-800/30">
                  <p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p>
                </div>
                <div className="flex-1">
                  <p className="text-purple-400"><span className="text-blue-400">#include</span> <span className="text-green-400">&lt;iostream&gt;</span></p>
                  <p className="text-blue-400">using namespace <span className="text-yellow-300">std</span>;</p>
                  <p className="text-slate-550 mt-1.5">// Operational Transformations synchronize code character by character</p>
                  <p className="text-blue-400">int <span className="text-yellow-400">main</span>() <span className="text-yellow-300">&#123;</span></p>
                  <p className="pl-6 text-slate-300">cout <span className="text-purple-400">&lt;&lt;</span> <span className="text-orange-300">"Hello World from real-time syncing!"</span> <span className="text-purple-400">&lt;&lt;</span> endl;</p>
                  <p className="pl-6 text-blue-400">return <span className="text-cyan-400">0</span>;</p>
                  <p className="text-yellow-300">&#125;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features Section ── */}
        <section className="w-full max-w-6xl mt-24 md:mt-36">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Designed for Seamless Engineering
            </h3>
            <p className={`text-sm max-w-xl mx-auto transition-colors duration-150 leading-relaxed ${
              theme === 'dark' ? 'text-slate-450' : 'text-slate-500'
            }`}>
              Everything you need for efficient pair programming, coding interview setups, and clean group debugging sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-md ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-808/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200/80 hover:border-slate-350 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2">Real-Time Syncing</h4>
              <p className={`text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Operational transformations handled natively. Write alongside teammates with lag-free cursors and immediate character bindings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-md ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-808/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200/80 hover:border-slate-350 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2">Multi-Lang Compiler</h4>
              <p className={`text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Run scripts instantly. Fully sandboxed compiler pipeline supporting C++, JavaScript, Python, Go, Java, and other platforms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-md ${
              theme === 'dark'
                ? 'bg-slate-900/10 border-slate-808/80 hover:bg-slate-900/20 hover:border-slate-700 shadow-black/5'
                : 'bg-white border-slate-200/80 hover:border-slate-350 shadow-slate-100 shadow-lg'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2">Administrative Locks</h4>
              <p className={`text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Prevent overlap during compiler operations. Lock inputs dynamically so only one execution is active at a single time.
              </p>
            </div>
          </div>
        </section>

        {/* ── Built-With / Tech Stack Showcase ── */}
        <section className="w-full max-w-6xl mt-24 md:mt-36 mb-12">
          <div className="text-center mb-12">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">THE ARCHITECTURE SYSTEM</h4>
            <h3 className="text-2xl font-bold mt-2">Engineered With Leading Standards</h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {['React.js', 'Yjs WebSockets', 'Node.js & Express', 'MongoDB', 'Socket.IO', 'TailwindCSS v4', 'Monaco Editor'].map((tech) => (
              <span key={tech} className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold shadow-sm transition-all duration-150 hover:scale-[1.03] ${
                theme === 'dark'
                  ? 'bg-slate-905/40 border-slate-805 text-slate-350 hover:text-white'
                  : 'bg-white border-slate-205 text-slate-600 hover:text-slate-800'
              }`}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ── Visual Feedback CTA section ── */}
        <section className={`w-full max-w-4xl mt-16 mb-8 border rounded-3xl p-8 text-center relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-tr from-cyan-950/10 to-indigo-950/10 border-slate-800/80 shadow-black/10'
            : 'bg-gradient-to-tr from-cyan-50/20 to-indigo-50/20 border-slate-200/80 shadow-slate-100 shadow-lg'
        }`}>
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
          
          <h3 className="text-xl font-extrabold tracking-tight mb-2">Help Us Improve CollabCode</h3>
          <p className={`text-xs max-w-md mx-auto mb-6 transition-colors duration-150 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            We are constantly tuning our real-time synchronization engine and sandboxed compilers. Share your reviews or suggest new integrations directly to our admin team.
          </p>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-650 hover:from-cyan-405 hover:to-indigo-555 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Write a Quick Review</span>
          </Link>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={`border-t text-center py-6 text-xs font-mono tracking-wide mt-auto transition-colors duration-300 relative z-10 ${
        theme === 'dark' ? 'bg-[#04060a] border-slate-900 text-slate-650' : 'bg-slate-50 border-slate-200/60 text-slate-450 shadow-inner'
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
