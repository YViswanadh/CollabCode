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

  // Security gate redirection
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
      setError(err?.response?.data?.message || 'Failed to fetch administrator console metrics. Please check server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, currentUser]);

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback review entry?')) return;
    try {
      await deleteFeedback(id, token);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      // Refresh metrics since counts changed
      const metricsRes = await fetchMetrics(token);
      setMetrics(metricsRes.metrics);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete feedback.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile? Doing so will purge all corresponding feedbacks.')) return;
    try {
      await deleteUser(id, token);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setFeedbacks((prev) => prev.filter((f) => f.userId !== id));
      // Refresh metrics
      const metricsRes = await fetchMetrics(token);
      setMetrics(metricsRes.metrics);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null; // Don't render anything while redirecting
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 animate-page-transition overflow-x-hidden ${
      theme === 'dark'
        ? 'bg-[#080c14] text-slate-100'
        : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* ── Nav Header ── */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#080c14]/80 border-slate-800/80 shadow-cyan-950/5'
          : 'bg-[#ffffff]/80 border-slate-200/80 shadow-slate-100/60'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Collab<span className={`transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wider font-mono">ADMIN SHIELD CONSOLE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/40'
                : 'bg-slate-100/80 border-slate-200 text-indigo-600 hover:text-indigo-505 hover:bg-slate-200/40'
            }`}
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
          <Link
            to="/workspace"
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-650 hover:from-cyan-405 hover:to-indigo-555 text-white font-extrabold shadow-md shadow-cyan-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Workspace
          </Link>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        
        {/* Banner header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Administrative Shield Workspace</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Monitor users count, drop legacy records, and parse workspace feedback reviews.
            </p>
          </div>
          <button
            onClick={loadData}
            className={`self-start px-4 py-2 text-xs rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-205 text-slate-655 hover:text-slate-800 shadow-sm'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18.75" />
            </svg>
            Refresh Metrics
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Metrics Grid Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className={`p-6 border rounded-3xl shadow-md transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/20 border-slate-808/80' : 'bg-white border-slate-200 shadow-slate-100 shadow-lg'
          }`}>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Collaborators</p>
            {loading ? (
              <div className="h-8 w-12 bg-slate-800/40 animate-pulse rounded-md mt-2" />
            ) : (
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{metrics?.totalUsers || 0}</h3>
            )}
          </div>

          {/* Card 2 */}
          <div className={`p-6 border rounded-3xl shadow-md transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/20 border-slate-808/80' : 'bg-white border-slate-200 shadow-slate-100 shadow-lg'
          }`}>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Sync Rooms</p>
            {loading ? (
              <div className="h-8 w-12 bg-slate-800/40 animate-pulse rounded-md mt-2" />
            ) : (
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{metrics?.totalDocuments || 0}</h3>
            )}
          </div>

          {/* Card 3 */}
          <div className={`p-6 border rounded-3xl shadow-md transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/20 border-slate-808/80' : 'bg-white border-slate-200 shadow-slate-100 shadow-lg'
          }`}>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Review Forms</p>
            {loading ? (
              <div className="h-8 w-12 bg-slate-800/40 animate-pulse rounded-md mt-2" />
            ) : (
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{metrics?.totalFeedbacks || 0}</h3>
            )}
          </div>

          {/* Card 4 */}
          <div className={`p-6 border rounded-3xl shadow-md transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/20 border-slate-808/80' : 'bg-white border-slate-200 shadow-slate-100 shadow-lg'
          }`}>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Average User Score</p>
            {loading ? (
              <div className="h-8 w-12 bg-slate-800/40 animate-pulse rounded-md mt-2" />
            ) : (
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight text-amber-500 flex items-center gap-1.5">
                {metrics?.averageRating || '0'}
                <span className="text-xs text-slate-450 font-normal">/ 5.0 ★</span>
              </h3>
            )}
          </div>
        </div>

        {/* ── Statistics Visualizations ── */}
        {!loading && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none animate-fade-in">
            {/* Donut Chart: Experience Breakdown */}
            <div className={`p-6 border rounded-3xl shadow-lg transition-all duration-300 flex flex-col justify-between ${
              theme === 'dark' ? 'bg-slate-900/20 border-slate-800/80 shadow-black/10' : 'bg-white border-slate-200/80 shadow-slate-100 shadow-lg'
            }`}>
              <div>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider mb-2 text-cyan-400">Collaborator Tiers</h3>
                <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Distribution of users by self-reported experience level.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={theme === 'dark' ? '#162035' : '#f1f5f9'} strokeWidth="4.5" />
                    {/* Beginner Segment */}
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
                    {/* Intermediate Segment */}
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
                    {/* Expert Segment */}
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
                    <span className="text-xl font-extrabold">{totalExp}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Profiles</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3 font-mono text-[11px] w-full sm:w-auto shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                    <span className="flex-1 text-slate-450">Beginners:</span>
                    <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>
                      {metrics.experienceBreakdown.beginner} ({totalExp ? Math.round((metrics.experienceBreakdown.beginner / totalExp) * 100) : 0}%)
                    </strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                    <span className="flex-1 text-slate-450">Intermediates:</span>
                    <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>
                      {metrics.experienceBreakdown.intermediate} ({totalExp ? Math.round((metrics.experienceBreakdown.intermediate / totalExp) * 100) : 0}%)
                    </strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                    <span className="flex-1 text-slate-450">Experts:</span>
                    <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>
                      {metrics.experienceBreakdown.expert} ({totalExp ? Math.round((metrics.experienceBreakdown.expert / totalExp) * 100) : 0}%)
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart: Feedback Rating Distributions */}
            <div className={`p-6 border rounded-3xl shadow-lg transition-all duration-300 flex flex-col justify-between ${
              theme === 'dark' ? 'bg-slate-900/20 border-slate-800/80 shadow-black/10' : 'bg-white border-slate-200/80 shadow-slate-100 shadow-lg'
            }`}>
              <div>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider mb-2 text-indigo-400">Review Score Distribution</h3>
                <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visual frequency analysis of star levels submitted by active collaborators.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-end justify-around gap-6 h-36">
                {ratingDistribution.map((dist) => {
                  const percent = Math.round((dist.count / maxDistributionCount) * 100);
                  return (
                    <div key={dist.stars} className="flex flex-col items-center gap-2 flex-1 w-full">
                      <div className="relative w-full flex items-end justify-center h-24 bg-slate-950/20 dark:bg-slate-900/30 rounded-xl overflow-hidden border border-slate-800/10">
                        <div
                          style={{ height: `${percent || 4}%` }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-700 bg-gradient-to-t ${
                            dist.stars >= 4
                              ? 'from-emerald-600 to-teal-500 shadow-emerald-500/10'
                              : dist.stars === 3
                                ? 'from-amber-600 to-yellow-500 shadow-yellow-500/10'
                                : 'from-red-600 to-pink-500 shadow-red-500/10'
                          }`}
                        />
                        <span className="absolute top-1 text-[9px] font-mono font-bold text-slate-500">{dist.count}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-450">{dist.stars} ★</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs selector ── */}
        <div className="flex items-center border-b border-slate-800/40 gap-6">
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`pb-3.5 text-sm font-bold font-mono uppercase tracking-wider relative transition-all cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            Review Submissions ({feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3.5 text-sm font-bold font-mono uppercase tracking-wider relative transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            Collaborators Directory ({users.length})
          </button>
        </div>

        {/* ── Tabs Canvas ── */}
        <div className="transition-all duration-300">
          {loading ? (
            <div className="flex flex-col gap-4 py-8 items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-slate-500">Querying database...</p>
            </div>
          ) : activeTab === 'feedbacks' ? (
            /* Feedbacks list */
            feedbacks.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-sm">
                No user review forms found inside MongoDB database.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbacks.map((f) => (
                  <div
                    key={f._id}
                    className={`border rounded-3xl p-6 shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      theme === 'dark'
                        ? 'bg-slate-900/10 border-slate-808/80 shadow-black/10 hover:bg-slate-900/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-slate-100 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-808/45 mb-4">
                        <div>
                          <p className="text-sm font-extrabold">{f.displayName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{f.email}</p>
                        </div>
                        <div className="flex items-center text-amber-500 font-bold text-sm">
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        "{f.comments}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-808/45">
                      <span className="text-[9px] font-mono text-slate-500">
                        {new Date(f.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteFeedback(f._id)}
                        className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Delete Submission
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Users Directory list */
            users.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-sm">
                No users found. Purged.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-3xl transition-all duration-300 shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-mono transition-colors duration-150 ${
                      theme === 'dark' ? 'bg-slate-900/30 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <th className="p-4">Collaborator</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Bio Description</th>
                      <th className="p-4">Experience Tier</th>
                      <th className="p-4">Clearance Role</th>
                      <th className="p-4 text-right">Administrative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className={`border-b transition-all duration-150 ${
                          theme === 'dark'
                            ? 'bg-slate-900/10 border-slate-805/60 hover:bg-slate-900/20'
                            : 'bg-white border-slate-100 hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="p-4 font-bold">{u.displayName}</td>
                        <td className="p-4 font-mono text-slate-500">{u.email}</td>
                        <td className="p-4 max-w-[200px] truncate" title={u.bio}>
                          {u.bio || <span className="opacity-40 italic">Empty bio</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                            u.experience === 'expert'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : u.experience === 'intermediate'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {u.experience}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === currentUser.userId}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                              u._id === currentUser.userId
                                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600 bg-transparent'
                                : 'border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 cursor-pointer'
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
      <footer className={`border-t text-center py-4 text-xs font-mono tracking-wide mt-auto transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#04060a] border-slate-900 text-slate-650' : 'bg-slate-50 border-slate-200/60 text-slate-450 shadow-inner'
      }`}>
        ADMINISTRATIVE SECURED SHELL &copy; {new Date().getFullYear()} &bull; ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
