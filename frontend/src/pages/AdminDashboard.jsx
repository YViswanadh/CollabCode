import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchMetrics,
  fetchFeedbacks,
  fetchUsers,
  deleteFeedback,
  deleteUser,
} from '../api/adminApi';

export default function AdminDashboard() {
  const { currentUser, token, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks' | 'users'

  // Security clearance redirect
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/workspace');
    }
  }, [currentUser, navigate]);

  const loadData = async () => {
    if (!token || !currentUser || currentUser.role !== 'admin') return;
    setLoading(true);
    setError('');
    try {
      const [metricsRes, feedbacksRes, usersRes] = await Promise.all([
        fetchMetrics(token),
        fetchFeedbacks(token),
        fetchUsers(token),
      ]);
      setMetrics(metricsRes.metrics);
      setFeedbacks(feedbacksRes.feedbacks);
      setUsers(usersRes.users);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch administrator console metrics. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, currentUser]);

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to purge this user feedback review?')) return;
    try {
      await deleteFeedback(id, token);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      const metricsRes = await fetchMetrics(token);
      setMetrics(metricsRes.metrics);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purge feedback review.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to purge this user profile? Doing so will purge all corresponding feedbacks.')) return;
    try {
      await deleteUser(id, token);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setFeedbacks((prev) => prev.filter((f) => f.userId !== id));
      const metricsRes = await fetchMetrics(token);
      setMetrics(metricsRes.metrics);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purge user profile.');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null; 
  }

  const ratingDistribution = [1, 2, 3, 4, 5].map((stars) => {
    const count = feedbacks.filter((f) => f.rating === stars).length;
    return { stars, count };
  });
  const maxDistributionCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  const totalExp = metrics
    ? (metrics.experienceBreakdown?.beginner || 0) +
      (metrics.experienceBreakdown?.intermediate || 0) +
      (metrics.experienceBreakdown?.expert || 0)
    : 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 animate-page-transition overflow-x-hidden relative ${
      theme === 'dark' ? 'bg-[#08090b] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Technical Background Canvas Grid */}
      <div className={`absolute inset-0 pointer-events-none z-0 [background-size:24px_24px] ${
        theme === 'dark'
          ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]'
          : 'bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)]'
      }`} />

      {/* Ambient glowing fields */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/5 to-indigo-500/5 blur-[120px] pointer-events-none z-0 animate-glow-pulse" />

      {/* Header Toolbar */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#08090b]/80 border-slate-900/80 shadow-black/10'
          : 'bg-white/80 border-slate-200/80 shadow-slate-100/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
            <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Collab<span className={`transition-colors duration-155 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-widest font-mono uppercase">Admin Shield Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-850 shadow-inner'
                : 'bg-slate-50 border-slate-205 text-indigo-600 hover:text-indigo-550 hover:bg-slate-100 shadow-sm'
            }`}
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
          <Link
            to="/workspace"
            className="px-5 py-2.5 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold shadow-md shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Enter Workspace
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8 relative z-10">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850/40 dark:border-slate-900/60 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Administrative Shield Workspace</h2>
            <p className={`text-xs sm:text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Monitor real-time system metrics, manage verified profiles, and audit user reviews.
            </p>
          </div>
          <button
            onClick={loadData}
            className={`self-start px-4.5 py-2.5 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white shadow-inner'
                : 'bg-white border-slate-200 text-slate-655 hover:text-slate-800 shadow-sm'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18.75" />
            </svg>
            <span>Refresh Metrics</span>
          </button>
        </div>

        {error && (
          <div className="px-4.5 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5 animate-pulse">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Immersive Metrics Dashboard Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Collaborators',
              value: metrics?.totalUsers || 0,
              desc: 'Registered profiles',
              icon: (
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
            {
              label: 'Active Sync Rooms',
              value: metrics?.totalDocuments || 0,
              desc: 'Collaborative rooms',
              icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              label: 'Total Reviews Submitted',
              value: metrics?.totalFeedbacks || 0,
              desc: 'Database feedback count',
              icon: (
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              ),
            },
            {
              label: 'Average Score',
              value: metrics?.averageRating ? `${metrics.averageRating} / 5.0` : '0.0 / 5.0',
              desc: 'Collaborator rating average',
              icon: (
                <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ),
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`p-6 border rounded-2.5xl shadow-md transition-all duration-300 flex items-center justify-between gap-4 ${
                theme === 'dark' ? 'bg-[#0b0f19]/35 border-slate-900 shadow-black/10' : 'bg-white border-slate-200/80 shadow-slate-100 shadow-lg'
              }`}
            >
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">{card.label}</p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-800/40 animate-pulse rounded-md mt-1.5" />
                ) : (
                  <h3 className={`text-2.5xl font-extrabold tracking-tight mt-1 ${card.label === 'Average Score' ? 'text-amber-500' : ''}`}>{card.value}</h3>
                )}
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">{card.desc}</p>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-950/60 border-slate-900 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Immersive Analytics Visualizations ── */}
        {!loading && metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none animate-page-transition">
            
            {/* Experience Donut Visual */}
            <div className={`p-6 border rounded-3xl shadow-lg transition-all duration-300 flex flex-col justify-between ${
              theme === 'dark' ? 'bg-[#0b0f19]/35 border-slate-900 shadow-black/10' : 'bg-white border-slate-205 shadow-slate-100 shadow-lg'
            }`}>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Collaborator Tiers</h3>
                <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visual frequency breakdown of collaborators by self-reported tier.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={theme === 'dark' ? '#162035/30' : '#f1f5f9'} strokeWidth="4.2" />
                    
                    {/* Beginner ring segment */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#06b6d4"
                      strokeWidth="5"
                      strokeDasharray={`${totalExp ? ((metrics.experienceBreakdown.beginner / totalExp) * 100) : 0} ${100 - (totalExp ? ((metrics.experienceBreakdown.beginner / totalExp) * 100) : 0)}`}
                      strokeDashoffset="0"
                      className="transition-all duration-500"
                    />
                    
                    {/* Intermediate ring segment */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="5"
                      strokeDasharray={`${totalExp ? ((metrics.experienceBreakdown.intermediate / totalExp) * 100) : 0} ${100 - (totalExp ? ((metrics.experienceBreakdown.intermediate / totalExp) * 100) : 0)}`}
                      strokeDashoffset={totalExp ? -((metrics.experienceBreakdown.beginner / totalExp) * 100) : 0}
                      className="transition-all duration-500"
                    />
                    
                    {/* Expert ring segment */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#6366f1"
                      strokeWidth="5"
                      strokeDasharray={`${totalExp ? ((metrics.experienceBreakdown.expert / totalExp) * 100) : 0} ${100 - (totalExp ? ((metrics.experienceBreakdown.expert / totalExp) * 100) : 0)}`}
                      strokeDashoffset={totalExp ? -(((metrics.experienceBreakdown.beginner + metrics.experienceBreakdown.intermediate) / totalExp) * 100) : 0}
                      className="transition-all duration-500"
                    />
                  </svg>
                  
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2.5xl font-extrabold">{totalExp}</span>
                    <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">Verifications</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-3 font-mono text-[11px] w-full sm:w-auto shrink-0 pr-4">
                  {[
                    { color: 'bg-cyan-500', name: 'Beginners', count: metrics.experienceBreakdown?.beginner || 0, colorText: 'text-cyan-400' },
                    { color: 'bg-blue-500', name: 'Mid-Tier', count: metrics.experienceBreakdown?.intermediate || 0, colorText: 'text-blue-400' },
                    { color: 'bg-indigo-500', name: 'Experts', count: metrics.experienceBreakdown?.expert || 0, colorText: 'text-indigo-400' }
                  ].map((leg, idx) => {
                    const percent = totalExp ? Math.round((leg.count / totalExp) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${leg.color}`} />
                        <span className="flex-1 text-slate-500">{leg.name}:</span>
                        <strong className={`font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                          {leg.count} <span className={`text-[10px] opacity-80 ${leg.colorText}`}>({percent}%)</span>
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Star Distribution Column visual */}
            <div className={`p-6 border rounded-3xl shadow-lg transition-all duration-300 flex flex-col justify-between ${
              theme === 'dark' ? 'bg-[#0b0f19]/35 border-slate-900 shadow-black/10' : 'bg-white border-slate-205 shadow-slate-100 shadow-lg'
            }`}>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 mb-2">Rating Distribution</h3>
                <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Histogram breakdown of system stars submitted by active collaborators.
                </p>
              </div>

              <div className="flex items-end justify-around gap-4 h-36 px-4">
                {ratingDistribution.map((dist) => {
                  const percent = Math.round((dist.count / maxDistributionCount) * 100);
                  return (
                    <div key={dist.stars} className="flex flex-col items-center gap-2 flex-1 w-full group">
                      <div className={`relative w-full flex items-end justify-center h-24 rounded-2xl overflow-hidden border transition-all duration-300 ${
                        theme === 'dark' ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50 border-slate-150'
                      }`}>
                        <div
                          style={{ height: `${percent || 4}%` }}
                          className={`w-full max-w-[24px] rounded-t-lg transition-all duration-700 bg-gradient-to-t ${
                            dist.stars >= 4
                              ? 'from-emerald-600 to-teal-500 shadow-emerald-500/10'
                              : dist.stars === 3
                                ? 'from-amber-600 to-yellow-500 shadow-yellow-500/10'
                                : 'from-red-600 to-pink-500 shadow-red-500/10'
                          }`}
                        />
                        <span className="absolute top-1.5 text-[9px] font-mono font-bold text-slate-500">{dist.count}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-450">{dist.stars} ★</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs Navigator ── */}
        <div className="flex items-center border-b border-slate-850/40 dark:border-slate-900/60 gap-8">
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`pb-4 text-xs sm:text-sm font-bold font-mono uppercase tracking-widest relative transition-all cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'text-cyan-400 border-b-2 border-cyan-500 font-extrabold'
                : 'text-slate-500 hover:text-slate-405'
            }`}
          >
            Review Forms ({feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-xs sm:text-sm font-bold font-mono uppercase tracking-widest relative transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'text-cyan-400 border-b-2 border-cyan-500 font-extrabold'
                : 'text-slate-500 hover:text-slate-405'
            }`}
          >
            Collaborators Directory ({users.length})
          </button>
        </div>

        {/* ── Tabs View Canvas ── */}
        <div className="transition-all duration-300">
          {loading ? (
            <div className="flex flex-col gap-4 py-16 items-center justify-center animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Querying database streams...</p>
            </div>
          ) : activeTab === 'feedbacks' ? (
            /* Feedbacks lists */
            feedbacks.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-sm uppercase tracking-wide">
                No user review forms found in database.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-page-transition">
                {feedbacks.map((f) => (
                  <div
                    key={f._id}
                    className={`border rounded-3xl p-6 shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      theme === 'dark'
                        ? 'bg-[#0b0f19]/25 border-slate-900 shadow-black/10 hover:bg-[#0b0f19]/35 hover:border-slate-800'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-slate-100 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/10 mb-4">
                        <div>
                          <p className="text-sm font-extrabold">{f.displayName}</p>
                          <p className="text-[10px] font-mono text-slate-500 font-medium">{f.email}</p>
                        </div>
                        <div className="flex items-center text-amber-500 font-bold text-sm">
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <span key={i} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">★</span>
                          ))}
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed italic ${theme === 'dark' ? 'text-slate-350' : 'text-slate-650'}`}>
                        "{f.comments}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-3.5 border-t border-slate-800/10">
                      <span className="text-[9px] font-mono text-slate-500 font-bold">
                        {new Date(f.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <button
                        onClick={() => handleDeleteFeedback(f._id)}
                        className="px-3.5 py-2 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                      >
                        Purge Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Users directory Table lists */
            users.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-sm uppercase tracking-wide">
                No active collaborators registered.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-3xl transition-all duration-300 shadow-md overflow-hidden animate-page-transition">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-mono font-bold uppercase tracking-wider text-[9px] transition-colors duration-150 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-900 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-550'
                    }`}>
                      <th className="p-4.5">Collaborator</th>
                      <th className="p-4.5">Email</th>
                      <th className="p-4.5">Profile Bio</th>
                      <th className="p-4.5">Experience Tier</th>
                      <th className="p-4.5">Clearance Level</th>
                      <th className="p-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className={`border-b transition-all duration-150 ${
                          theme === 'dark'
                            ? 'bg-slate-900/10 border-slate-900/50 hover:bg-slate-900/20'
                            : 'bg-white border-slate-100 hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="p-4.5 font-bold text-xs">{u.displayName}</td>
                        <td className="p-4.5 font-mono text-slate-500 font-medium">{u.email}</td>
                        <td className="p-4.5 max-w-[200px] truncate italic text-slate-450" title={u.bio}>
                          {u.bio || <span className="opacity-40 font-normal">No bio profile</span>}
                        </td>
                        <td className="p-4.5">
                          <span className={`px-2.5 py-0.75 rounded-lg font-bold text-[9px] uppercase tracking-wider font-mono ${
                            u.experience === 'expert'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                              : u.experience === 'intermediate'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {u.experience === 'intermediate' ? 'Mid-Tier' : u.experience}
                          </span>
                        </td>
                        <td className="p-4.5">
                          <span className={`px-2.5 py-0.75 rounded-lg font-bold text-[9px] uppercase tracking-wider font-mono ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-450 border border-slate-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4.5 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === currentUser.userId}
                            className={`px-3.5 py-2 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
                              u._id === currentUser.userId
                                ? 'opacity-35 cursor-not-allowed border-slate-900 text-slate-600 bg-transparent'
                                : 'border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 cursor-pointer active:scale-95'
                            }`}
                          >
                            Purge Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t text-center py-4.5 text-xs font-mono tracking-wider mt-auto transition-colors duration-500 relative z-10 ${
        theme === 'dark' ? 'bg-[#060709] border-slate-900 text-slate-600' : 'bg-slate-50 border-slate-205/50 text-slate-400 shadow-inner'
      }`}>
        SECURED CONSOLE SHIELD SYSTEM &bull; ADMINISTRATIVE PRIVILEGES &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
