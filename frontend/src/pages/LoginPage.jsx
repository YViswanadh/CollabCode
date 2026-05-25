import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/workspace';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email.trim(), form.password);
      if (data.user && data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
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

      {/* Logo */}
      <Link to="/" className="relative z-10 flex items-center gap-3 mb-8 active:scale-98 transition duration-150 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          Collab<span className={`transition-colors duration-150 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
        </h1>
      </Link>

      {/* Card */}
      <div className={`w-full max-w-md border rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 z-10 ${
        theme === 'dark'
          ? 'bg-[#0b0f19]/45 border-slate-900/80 shadow-black/20'
          : 'bg-white border-slate-200/80 shadow-slate-200/45 shadow-xl'
      }`}>
        
        {/* Floating Theme Toggle inside the card */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-950/40 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-905/60'
              : 'bg-slate-50 border-slate-200 text-indigo-650 hover:text-indigo-505 hover:bg-slate-100/60'
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

        {/* Ambient glows */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          theme === 'dark' ? 'bg-cyan-500/5' : 'bg-cyan-500/3'
        }`} />
        <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-500/3'
        }`} />

        <div className="relative">
          <div className="text-center mb-8">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4 transition-colors duration-150 ${
              theme === 'dark'
                ? 'bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-cyan-50 border-cyan-200 text-cyan-500'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-extrabold tracking-tight transition-colors duration-150 ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>Welcome back</h2>
            <p className={`text-sm mt-1 transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Sign in to your workspace
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-650 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-cyan-500/30 focus:border-cyan-500/40'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-650 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-cyan-500/30 focus:border-cyan-500/40'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
                  : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-indigo-500/10'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-cyan-500 hover:text-cyan-400 font-bold transition duration-150"
            >
              Create one
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-800/40 text-center select-none">
            <Link
              to="/feedback"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-mono uppercase tracking-wider font-bold"
            >
              <svg className="w-3.5 h-3.5 text-cyan-500/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Share System Feedback</span>
            </Link>
          </div>
        </div>
      </div>

      <p className={`text-xs font-mono mt-8 tracking-wider transition-colors duration-150 ${
        theme === 'dark' ? 'text-slate-700' : 'text-slate-400'
      }`}>
        COLLABCODE &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
