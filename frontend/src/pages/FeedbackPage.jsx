import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../api/feedbackApi';

export default function FeedbackPage() {
  const { currentUser, token, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      return setError('Please select a rating between 1 and 5 stars.');
    }
    if (comments.trim().length === 0) {
      return setError('Please share some comments or suggestions.');
    }

    setLoading(true);
    try {
      await submitFeedback({ rating, comments: comments.trim() }, token);
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30 transition-colors duration-300 animate-page-transition relative overflow-hidden ${
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
      {/* Ambient background blur circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/40'
              : 'bg-white border-slate-200 text-indigo-600 hover:text-indigo-500 hover:bg-slate-100/60 shadow-sm'
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
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          Collab<span className={`transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
        </h1>
      </Link>

      {/* Card Body */}
      <div className={`w-full max-w-lg border rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900/40 border-slate-800/80 shadow-black/20'
          : 'bg-white border-slate-202/80 shadow-slate-200/40 shadow-xl'
      }`}>

        {submitted ? (
          /* Successful Submission Screen */
          <div className="text-center py-6 space-y-6 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              Thank You!
            </h2>
            <p className={`text-sm max-w-xs mx-auto transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Your feedback was recorded successfully. Your suggestions help us improve CollabCode's environment.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Link
                to={currentUser ? '/workspace' : '/'}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                {currentUser ? 'Return to Workspace' : 'Go to Homepage'}
              </Link>
            </div>
          </div>
        ) : !currentUser ? (
          /* Unauthenticated Shield Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                Authentication Required
              </h2>
              <p className={`text-sm max-w-xs mx-auto mt-2 transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                To prevent spam and tie reviews to active workspace collaborators, please sign in before posting feedback.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                state={{ from: { pathname: '/feedback' } }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                Sign In to Review
              </Link>
              <Link
                to="/"
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl border transition-all duration-150 font-bold active:scale-95 text-xs ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm'
                }`}
              >
                Back to Safety
              </Link>
            </div>
          </div>
        ) : (
          /* Feedback Entry Form Screen */
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-extrabold tracking-tight transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>Share your feedback</h2>
              <p className={`text-sm mt-1 transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Help us enhance the synchronization & compiler systems
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star selector */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Overall System Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform duration-100 active:scale-90"
                      >
                        <svg
                          className={`w-9 h-9 transition-colors duration-150 ${
                            isActive
                              ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                              : theme === 'dark'
                                ? 'text-slate-800'
                                : 'text-slate-200'
                          }`}
                          fill={isActive ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={isActive ? '0.5' : '1.5'}
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
                {rating > 0 && (
                  <span className="text-xs font-mono font-bold text-amber-500 uppercase">
                    {rating === 1 && 'Needs Work 😠'}
                    {rating === 2 && 'Mediocre 😐'}
                    {rating === 3 && 'Decent 🙂'}
                    {rating === 4 && 'Great! 😃'}
                    {rating === 5 && 'Excellent! 🚀'}
                  </span>
                )}
              </div>

              {/* Text suggestions */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Comments or Suggestions
                </label>
                <textarea
                  rows="4"
                  maxLength="1000"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us what you like, or what compilers and lock mechanisms could be upgraded next..."
                  className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 resize-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-cyan-500/30 focus:border-cyan-500/40'
                  }`}
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
                  <span>Logged in as: {currentUser.displayName}</span>
                  <span>{comments.length}/1000</span>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving Review…
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
                <Link
                  to="/workspace"
                  className={`py-3.5 px-6 rounded-2xl border transition-all duration-150 font-bold active:scale-95 text-sm text-center cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm'
                  }`}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>

      <p className={`text-xs font-mono mt-8 tracking-wider transition-colors duration-150 ${
        theme === 'dark' ? 'text-slate-700' : 'text-slate-400'
      }`}>
        COLLABCODE &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
