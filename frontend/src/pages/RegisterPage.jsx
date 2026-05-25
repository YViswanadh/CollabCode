import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    experience: 'beginner',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.displayName.trim().length < 2) {
      return setError('Display name must be at least 2 characters.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const data = await register(
        form.displayName.trim(),
        form.email.trim(),
        form.password,
        form.bio.trim(),
        form.experience,
        form.role
      );
      if (data.user && data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/workspace', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-500/3'
        }`} />
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          theme === 'dark' ? 'bg-cyan-500/5' : 'bg-cyan-500/3'
        }`} />

        <div className="relative">
          <div className="text-center mb-8">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4 transition-colors duration-150 ${
              theme === 'dark'
                ? 'bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 border-indigo-500/20 text-indigo-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-500'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-extrabold tracking-tight transition-colors duration-150 ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>Create account</h2>
            <p className={`text-sm mt-1 transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Join the collaborative workspace
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                required
                autoComplete="name"
                value={form.displayName}
                onChange={handleChange}
                placeholder="e.g. Alex Chen"
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-655 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                }`}
              />
              <p className={`text-[10px] font-medium transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}>This is the name other collaborators will see in rooms.</p>
            </div>

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
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-655 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500/40'
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
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-655 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-500/50 focus:ring-red-500/30 bg-red-500/5'
                    : theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Short Bio (Optional)
              </label>
              <textarea
                name="bio"
                maxLength="200"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell other collaborators a bit about yourself..."
                rows="2"
                className={`w-full px-4 py-2.5 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 resize-none ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-805 text-slate-100 placeholder:text-slate-655 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                    : 'bg-slate-50 border-slate-205 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                }`}
              />
              <div className="text-right text-[9px] text-slate-550 font-mono">
                {form.bio.length}/200
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-805 text-slate-100 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                      : 'bg-slate-50 border-slate-205 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                  }`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-150 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Role Clearance
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-805 text-slate-100 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                      : 'bg-slate-50 border-slate-205 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500/40'
                  }`}
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-2 rounded-2xl font-extrabold text-sm shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-505 hover:to-cyan-400 text-white shadow-indigo-500/20'
                  : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-indigo-500/10'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-550 hover:text-indigo-450 font-bold transition duration-150"
            >
              Sign in
            </Link>
          </p>
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
