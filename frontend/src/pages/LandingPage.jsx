import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../api/feedbackApi';

export default function LandingPage() {
  const { currentUser, token, loading, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState('index.ts');

  // Interactive Feedback States
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Smooth scroll to feedback section if hash is present
  useEffect(() => {
    if (window.location.hash === '#feedback-section') {
      // Give a tiny timeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        const element = document.getElementById('feedback-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');

    if (feedbackRating === 0) {
      return setFeedbackError('Please select a rating between 1 and 5 stars.');
    }
    if (feedbackComments.trim().length === 0) {
      return setFeedbackError('Please share some comments or suggestions.');
    }

    setFeedbackLoading(true);
    try {
      await submitFeedback({ rating: feedbackRating, comments: feedbackComments.trim() }, token);
      setFeedbackSubmitted(true);
    } catch (err) {
      setFeedbackError(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${theme === 'dark' ? 'bg-[#08090b] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
        }`}>
        <div className="flex flex-col items-center gap-6 relative">
          <div className="w-20 h-20 relative flex items-center justify-center">
            <div className={`absolute inset-0 rounded-3xl border border-dashed animate-[spin_12s_linear_infinite] ${theme === 'dark' ? 'border-cyan-500/20' : 'border-indigo-500/20'
              }`} />
            <div className={`absolute inset-2 rounded-2xl border border-dashed animate-[spin_8s_linear_infinite_reverse] ${theme === 'dark' ? 'border-indigo-500/20' : 'border-cyan-500/20'
              }`} />
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 animate-page-transition overflow-hidden relative ${theme === 'dark' ? 'bg-[#08090b] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      }`}>
      {/* ── Stitch Canvas Technical Background Grid ── */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 [background-size:24px_24px] ${theme === 'dark'
        ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]'
        : 'bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)]'
        }`} />

      {/* Ambient glowing fields */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/10 to-indigo-600/5 blur-[120px] pointer-events-none z-0 animate-glow-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/5 to-purple-600/5 blur-[140px] pointer-events-none z-0 animate-glow-pulse" />

      {/* ── Premium Navigation Header ── */}
      <header className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between transition-all duration-300 ${theme === 'dark'
        ? 'bg-[#08090b]/80 border-slate-900 shadow-sm shadow-black/10'
        : 'bg-white/80 border-slate-200/60 shadow-sm shadow-slate-100/50'
        }`}>
        <Link to="/" className="flex items-center gap-3 active:scale-98 transition duration-150 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
            <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Collab<span className={`transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-widest font-mono uppercase">Infinite Canvas Sync</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Custom Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 shadow-inner'
              : 'bg-slate-50 border-slate-200 text-indigo-600 hover:text-indigo-500 hover:bg-slate-100 shadow-sm'
              }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {currentUser ? (
            <Link
              to="/workspace"
              className="px-6 py-2.5 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Go to Workspace
            </Link>
          ) : (
            <Link
              to="/login"
              className={`px-6 py-2.5 text-xs rounded-xl border transition-all duration-200 font-extrabold active:scale-95 cursor-pointer ${theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 shadow-inner'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-350 shadow-sm'
                }`}
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* ── Main Canvas Hero Area ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-4xl text-center space-y-8">
          <div className={`inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full border text-[10px] sm:text-xs font-bold tracking-widest font-mono transition-all duration-300 uppercase shadow-sm ${theme === 'dark'
            ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-400'
            : 'bg-cyan-50/50 border-cyan-200/70 text-cyan-600'
            }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            STITCH AI INTEGRATION &bull; COLLABCODE V2.5
          </div>

          <h2 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] select-none">
            Code at the <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Speed of Design</span>
          </h2>

          <p className={`text-sm sm:text-base max-w-2xl mx-auto transition-colors duration-150 font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
            The collaborative coding environment built for modern engineers. Infinite canvas workspace, zero-latency pair programming, live preview integrations, and high-fidelity code engines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-3">
            <button
              onClick={handleCTA}
              className={`px-8 py-4 rounded-xl font-extrabold text-sm active:scale-95 transition-all duration-300 cursor-pointer shadow-lg tracking-wide ${theme === 'dark'
                ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-white/5'
                : 'bg-slate-950 text-white hover:bg-slate-900 shadow-slate-950/15'
                }`}
            >
              Start Coding Now
            </button>
          </div>
        </div>

        {/* ── Immersive Interactive Workspace Mockup ── */}
        <div className="w-full max-w-5xl mt-16 md:mt-24 z-10 transition-transform duration-500 hover:scale-[1.005]">
          <div className={`border rounded-3xl p-3 shadow-2xl transition-all duration-300 ${theme === 'dark'
            ? 'bg-[#0b0f19]/70 border-slate-800 shadow-cyan-950/5'
            : 'bg-white/80 border-slate-200 shadow-slate-200/50'
            }`}>
            {/* Header / Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/10 mb-3 px-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />

                {/* Simulated workspace tabs */}
                <div className="flex items-center gap-1 ml-6 text-[10px] font-mono">
                  {['index.ts', 'styles.css'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePlaygroundTab(tab)}
                      className={`px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activePlaygroundTab === tab
                        ? theme === 'dark'
                          ? 'bg-[#08090b] border-slate-800 text-cyan-400'
                          : 'bg-slate-100 border-slate-250 text-indigo-600 shadow-sm'
                        : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                    >
                      {tab}
                      {tab === 'index.ts' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono border ${theme === 'dark'
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Sync Stream Live</span>
              </div>
            </div>

            {/* Simulated Live Editor Screen */}
            <div className={`p-6 rounded-2xl font-mono text-xs overflow-hidden border transition-colors duration-150 relative ${theme === 'dark' ? 'bg-[#08090b] border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-700'
              }`}>

              {/* Latency side widget */}
              <div className={`absolute top-6 right-6 p-4.5 rounded-xl border z-20 backdrop-blur shadow-lg hidden sm:flex flex-col gap-2.5 max-w-[190px] text-[10px] ${theme === 'dark'
                ? 'bg-slate-950/90 border-slate-850 text-slate-450'
                : 'bg-white/95 border-slate-200 text-slate-605'
                }`}>
                <span className="font-bold text-[9px] uppercase tracking-wider font-sans text-slate-500">Workspace Latency</span>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span>Region Outpost</span>
                    <span className="text-emerald-400 font-bold font-mono">0.4ms</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800/40 rounded overflow-hidden">
                    <div className="w-[92%] h-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1.5 border-t border-slate-800/10 pt-2">
                  <span>Stream Health</span>
                  <span className="text-cyan-400 font-bold uppercase text-[8px] border border-cyan-500/20 px-1.5 py-0.5 rounded bg-cyan-500/5">Perfect</span>
                </div>
              </div>

              {/* Cursor flags simulation */}
              <div className="absolute top-[48%] left-[45%] z-20 flex flex-col items-start pointer-events-none">
                <div className="h-4 w-[2px] bg-purple-500" />
                <span className="text-[8px] bg-purple-500 text-white px-2 py-0.5 rounded font-bold shadow font-sans mt-0.5 whitespace-nowrap animate-pulse">
                  Alex is editing...
                </span>
              </div>

              <div className="absolute top-[28%] left-[22%] z-20 flex flex-col items-start pointer-events-none">
                <div className="h-4 w-[2px] bg-cyan-400" />
                <span className="text-[8px] bg-cyan-400 text-slate-950 px-2 py-0.5 rounded font-bold shadow font-sans mt-0.5 whitespace-nowrap animate-pulse">
                  Sofia
                </span>
              </div>

              {/* Dynamic playground content tabs */}
              <div className="flex gap-4">
                <div className="text-slate-600 text-right select-none pr-3 border-r border-slate-800/20">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <p key={i}>{i + 1}</p>
                  ))}
                </div>
                <div className="flex-1">
                  {activePlaygroundTab === 'index.ts' && (
                    <>
                      <p className="text-purple-400"><span className="text-blue-400">import</span> &#123; <span className="text-yellow-300">StitchCanvas</span> &#125; <span className="text-blue-400">from</span> <span className="text-green-400">"@collabcode/canvas"</span>;</p>
                      <br />
                      <p className="text-blue-400">const <span className="text-cyan-400">workspace</span> = <span className="text-blue-400">new</span> <span className="text-yellow-400">StitchCanvas</span>(&#123;</p>
                      <p className="pl-6 text-slate-500">latency: <span className="text-cyan-400">"zero-latency"</span>,</p>
                      <p className="pl-6 text-blue-400">synced: <span className="text-cyan-400">true</span>,</p>
                      <p className="pl-6 text-slate-500">engine: <span className="text-cyan-400">"high-fidelity"</span></p>
                      <p className="text-blue-400">&#125;);</p>
                      <br />
                      <p className="text-slate-500">// Start collaborative coding canvas session...</p>
                    </>
                  )}
                  {activePlaygroundTab === 'styles.css' && (
                    <>
                      <p className="text-slate-400">/* Infinite design canvas accents */</p>
                      <p className="text-yellow-400">.stitch-workspace <span className="text-blue-400">&#123;</span></p>
                      <p className="pl-6 text-purple-400">background-color<span className="text-slate-300">:</span> <span className="text-cyan-400">#08090b</span>;</p>
                      <p className="pl-6 text-purple-400">backdrop-filter<span className="text-slate-300">:</span> <span className="text-cyan-400">blur(16px)</span>;</p>
                      <p className="pl-6 text-purple-400">border<span className="text-slate-300">:</span> <span className="text-cyan-400">1px solid rgba(255, 255, 255, 0.04)</span>;</p>
                      <p className="text-blue-400">&#125;</p>
                    </>
                  )}
                  {activePlaygroundTab === 'engine.js' && (
                    <>
                      <p className="text-blue-400">function <span className="text-yellow-400">syncStream</span><span className="text-slate-350">(room, doc)</span> &#123;</p>
                      <p className="pl-6 text-blue-400">const provider = <span className="text-blue-400">new</span> <span className="text-yellow-400">WebsocketProvider</span><span className="text-slate-300">(room, doc);</span></p>
                      <p className="pl-6 text-slate-550">console.log(`[CollabCode] Syncing connection: ${room}`);</p>
                      <p className="pl-6 text-blue-400">return provider;</p>
                      <p className="text-blue-400">&#125;</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modern Premium Features Showcase ── */}
        <section className="w-full max-w-6xl mt-28 md:mt-36">
          <div className="text-center space-y-4 mb-20">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Designed for Seamless Engineering
            </h3>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto transition-colors duration-150 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
              Everything your team needs for clean, highly performant real-time pair programming and code reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <div className={`p-8 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex gap-6 ${theme === 'dark'
              ? 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/30 hover:border-slate-700 shadow-black/5'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
              }`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Ultra-Low Latency</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our optimized sync sockets ensure that all typing, selections, and cursors are updated across continents instantly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex gap-6 ${theme === 'dark'
              ? 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/30 hover:border-slate-700 shadow-black/5'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
              }`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Active Presence Sync</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Follow cursors, text highlights, and room updates in real-time, backed by clean collaborative state engines.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex gap-6 ${theme === 'dark'
              ? 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/30 hover:border-slate-700 shadow-black/5'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
              }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Synchronized Compilation</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Run and execute algorithms directly inside a shared console, complete with locking controls so outputs remain synchronized.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className={`p-8 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex gap-6 ${theme === 'dark'
              ? 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/30 hover:border-slate-700 shadow-black/5'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100 shadow-lg'
              }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold">Tailored Developer Tools</h4>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fully integrated Monaco Editor setup, with custom sizing, togglable minimap, word wrap preferences, and direct feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Technical Stack Badge Ribbon ── */}
        <section className="w-full max-w-6xl mt-28 md:mt-36">
          <div className="text-center mb-10">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">SYSTEM ARCHITECTURE</h4>
            <h3 className="text-xl font-bold mt-2">Built with Modern Open-Source Foundations</h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {['React 19', 'Yjs & Y-WebSocket', 'Socket.IO', 'Monaco Editor', 'Node.js & Express', 'MongoDB', 'TailwindCSS v4'].map((tech) => (
              <span key={tech} className={`px-4.5 py-2.5 rounded-xl border text-xs font-mono font-bold shadow-sm transition-all duration-300 hover:scale-[1.03] ${theme === 'dark'
                ? 'bg-slate-900/40 border-slate-800 text-slate-350 hover:text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ── Interactive Live Feedback Section ── */}
        <section id="feedback-section" className="w-full max-w-4xl mt-24">
          <div className="text-center mb-10">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">SYSTEM DIAGNOSTICS & RATINGS</h4>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2">Help Refine Zero-Latency Sync Streams</h3>
            <p className={`text-xs mt-2 max-w-md mx-auto leading-relaxed transition-colors duration-155 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
              Your ratings directly guide the engineering team on synchronizations, compilers, and editor performance metrics.
            </p>
          </div>

          <div className={`border rounded-3xl p-8 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 ${theme === 'dark'
            ? 'bg-[#0b0f19]/35 border-slate-900/80 shadow-black/10'
            : 'bg-white border-slate-200/80 shadow-slate-200/30 shadow-lg'
            }`}>
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/5 blur-2xl rounded-full" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />

            {feedbackSubmitted ? (
              /* Success screen */
              <div className="text-center py-6 space-y-4 animate-page-transition">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Feedback Submitted!</h3>
                <p className={`text-xs max-w-sm mx-auto leading-relaxed transition-colors duration-155 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                  Thank you for contributing your suggestions. Your notes help the engineering team expand our real-time sync systems.
                </p>
              </div>
            ) : !currentUser ? (
              /* Prompt to log in */
              <div className="text-center py-8 space-y-5 animate-page-transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`text-base font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Sign-In Clearance Required</h4>
                  <p className={`text-xs max-w-sm mx-auto mt-2 leading-relaxed transition-colors duration-155 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    To maintain database integrity and prevent anonymous review spam, please log in first to leave feedback.
                  </p>
                </div>
                <div className="flex justify-center pt-2">
                  <Link
                    to="/login"
                    state={{ from: { pathname: '/' } }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider font-mono shadow-md active:scale-95 transition-all duration-200"
                  >
                    Sign In to Share Feedback
                  </Link>
                </div>
              </div>
            ) : (
              /* Interactive form */
              <form onSubmit={handleFeedbackSubmit} className="space-y-6 relative animate-page-transition">
                {feedbackError && (
                  <div className="px-4.5 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5 animate-pulse">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{feedbackError}</span>
                  </div>
                )}

                <div className="flex flex-col items-center justify-center space-y-2 py-1 select-none">
                  <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    Overall System Rating
                  </label>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= (hoverRating || feedbackRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-90"
                        >
                          <svg
                            className={`w-9 h-9 transition-colors duration-200 ${isActive
                              ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : theme === 'dark'
                                ? 'text-slate-800'
                                : 'text-slate-200'
                              }`}
                            fill={isActive ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={isActive ? '0.4' : '1.8'}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499c.174-.367.697-.367.87 0l2.303 4.86c.07.147.213.25.376.274l5.228.77c.394.057.55.53.266.804l-3.784 3.69c-.118.115-.172.28-.143.444l.894 5.205c.068.393-.34.692-.686.507l-4.675-2.457a.447.447 0 00-.417 0l-4.675 2.457c-.346.185-.754-.114-.686-.507l.894-5.205a.447.447 0 00-.143-.444l-3.784-3.69c-.283-.274-.127-.747.266-.804l5.228-.77a.447.447 0 00.376-.274l2.303-4.86z"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>

                  {feedbackRating > 0 && (
                    <span className="text-[10px] font-mono font-extrabold text-amber-500 uppercase tracking-widest animate-pulse mt-1">
                      {feedbackRating === 1 && 'Needs Work 😠'}
                      {feedbackRating === 2 && 'Mediocre 😐'}
                      {feedbackRating === 3 && 'Decent 🙂'}
                      {feedbackRating === 4 && 'Great! 😃'}
                      {feedbackRating === 5 && 'Excellent! 🚀'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    Comments and Suggestions
                  </label>
                  <textarea
                    rows="3"
                    maxLength="1000"
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Share what compilers, libraries, or layouts you would like integrated in the next updates stream..."
                    className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 text-xs focus:outline-none focus:ring-2 resize-none ${theme === 'dark'
                      ? 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-700 focus:ring-cyan-500/40 focus:border-cyan-500/45'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-cyan-500/25 focus:border-cyan-500/35 shadow-sm'
                      }`}
                  />
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono px-1">
                    <span>Signed in as: {currentUser?.displayName}</span>
                    <span>{feedbackComments.length}/1000</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider font-mono shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {feedbackLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Saving Review…</span>
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ── Custom Footnotes Footer ── */}
      <footer className={`border-t text-center py-8 text-xs font-mono tracking-wide mt-auto transition-colors duration-300 relative z-10 ${theme === 'dark' ? 'bg-[#060709] border-slate-900 text-slate-550' : 'bg-slate-50 border-slate-200/50 text-slate-400 shadow-inner'
        }`}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-2">
          <span>COLLABCODE &copy; {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">&bull;</span>
          <a
            href="#feedback-section"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('feedback-section');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, '', '#feedback-section');
            }}
            className="hover:text-cyan-400 transition-colors font-bold"
          >
            Feedback & Reviews
          </a>
        </div>
        <p className="text-[10px] opacity-60">High-fidelity pair programming. Crafted with premium grid canvas templates.</p>
      </footer>
    </div>
  );
}
