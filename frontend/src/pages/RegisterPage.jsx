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

  const setExperience = (lvl) => {
    setForm((prev) => ({ ...prev, experience: lvl }));
  };

  const setRole = (r) => {
    setForm((prev) => ({ ...prev, role: r }));
  };

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
      setError(err?.response?.data?.message || 'Registration failed. Please check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30 transition-colors duration-500 animate-page-transition relative overflow-hidden ${
      theme === 'dark' ? 'bg-[#08090b] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Technical Background Grid */}
      <div className={`absolute inset-0 pointer-events-none z-0 [background-size:24px_24px] ${
        theme === 'dark'
          ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]'
          : 'bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)]'
      }`} />

      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-indigo-500/5 to-cyan-500/5 blur-[100px] pointer-events-none z-0 animate-glow-pulse" />

      {/* Logo */}
      <Link to="/" className="relative z-10 flex items-center gap-3 mb-6 active:scale-98 transition duration-150 cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
          <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          Collab<span className={`transition-colors duration-155 ${theme === 'dark' ? 'text-slate-100 font-medium' : 'text-slate-900 font-medium'}`}>Code</span>
        </h1>
      </Link>

      {/* Card Container */}
      <div className={`w-full max-w-lg border rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 z-10 ${
        theme === 'dark'
          ? 'bg-[#0b0f19]/45 border-slate-900/80 shadow-black/35'
          : 'bg-white border-slate-200 shadow-slate-250/50 shadow-xl'
      }`}>
        
        {/* Floating Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-950/40 border-slate-850 text-amber-400 hover:text-amber-300 hover:bg-slate-900/60 shadow-inner'
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

        <div className="relative">
          <div className="text-center mb-8">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
              theme === 'dark'
                ? 'bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 border-indigo-500/20 text-indigo-400 shadow-inner'
                : 'bg-indigo-50 border-indigo-200 text-indigo-500 shadow-sm'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-extrabold tracking-tight transition-colors duration-150 ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>Create Account</h2>
            <p className={`text-xs mt-1 font-medium transition-colors duration-150 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Register to participate in multi-user code synchronization
            </p>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div className="mb-5 px-4.5 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5 animate-pulse">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
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
                className={`w-full px-4.5 py-3 rounded-2xl border transition-all duration-300 text-xs focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-650 focus:ring-cyan-500/40 focus:border-cyan-500/45'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-455 focus:ring-cyan-500/25 focus:border-cyan-500/35 shadow-sm'
                }`}
              />
            </div>

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
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
                placeholder="you@domain.com"
                className={`w-full px-4.5 py-3 rounded-2xl border transition-all duration-300 text-xs focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-650 focus:ring-cyan-500/40 focus:border-cyan-500/45'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-455 focus:ring-cyan-500/25 focus:border-cyan-500/35 shadow-sm'
                }`}
              />
            </div>

            {/* Passwords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
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
                  placeholder="Min. 6 chars"
                  className={`w-full px-4.5 py-3 rounded-2xl border transition-all duration-300 text-xs focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-650 focus:ring-cyan-500/40 focus:border-cyan-500/45'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-455 focus:ring-cyan-500/25 focus:border-cyan-500/35 shadow-sm'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
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
                  className={`w-full px-4.5 py-3 rounded-2xl border transition-all duration-300 text-xs focus:outline-none focus:ring-2 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-500/55 focus:ring-red-500/30 bg-red-500/5'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800 text-slate-100 focus:ring-cyan-500/40 focus:border-cyan-500/45'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-cyan-500/25 focus:border-cyan-500/35 shadow-sm'
                  }`}
                />
              </div>
            </div>

            {/* Experience level selector (WOW redesign) */}
            <div className="space-y-2">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Self-Reported Experience level
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'Starting out' },
                  { value: 'intermediate', label: 'Mid-Tier', desc: 'Developing' },
                  { value: 'expert', label: 'Expert', desc: 'Ship fast' }
                ].map((lvl) => {
                  const isActive = form.experience === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setExperience(lvl.value)}
                      className={`px-3 py-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 active:scale-95 ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-inner'
                            : 'bg-indigo-500/10 border-indigo-500 text-indigo-600 shadow-sm'
                          : theme === 'dark'
                            ? 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono tracking-wide">{lvl.label}</span>
                      <span className="text-[8px] opacity-60 mt-0.5 leading-none font-normal font-sans">{lvl.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Bio Text Area */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Bio Description (Optional)
              </label>
              <textarea
                name="bio"
                maxLength="200"
                value={form.bio}
                onChange={handleChange}
                placeholder="Briefly introduce your coding focus..."
                rows="2"
                className={`w-full px-4.5 py-3 rounded-2xl border transition-all duration-300 text-xs focus:outline-none focus:ring-2 resize-none ${
                  theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-650 focus:ring-cyan-500/40 focus:border-cyan-500/45'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-455 focus:ring-cyan-500/25 focus:border-cyan-500/35 shadow-sm'
                }`}
              />
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-1">
                <span>Maximum 200 characters</span>
                <span>{form.bio.length}/200</span>
              </div>
            </div>

            {/* Role Clearance Select or toggler badge */}
            <div className="space-y-2">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider font-mono transition-colors duration-155 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Clearance Level
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'user', label: 'Developer', desc: 'Full editing access' },
                  { value: 'admin', label: 'Administrator', desc: 'Console & purge access' }
                ].map((rl) => {
                  const isActive = form.role === rl.value;
                  return (
                    <button
                      key={rl.value}
                      type="button"
                      onClick={() => setRole(rl.value)}
                      className={`px-4 py-2.5 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 active:scale-95 ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-inner'
                            : 'bg-cyan-500/10 border-cyan-500 text-cyan-600 shadow-sm'
                          : theme === 'dark'
                            ? 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono tracking-wide">{rl.label}</span>
                      <span className="text-[8px] opacity-60 mt-0.5 leading-none font-normal font-sans">{rl.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider font-mono shadow-lg active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-650 via-blue-600 to-cyan-500 hover:from-indigo-550 hover:to-cyan-400 text-white shadow-indigo-500/15'
                  : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-indigo-500/15'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Configuring Profile…</span>
                </>
              ) : (
                'Create Profile'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already registered?{' '}
            <Link
              to="/login"
              className="text-cyan-500 hover:text-cyan-400 font-bold transition duration-150"
            >
              Login now
            </Link>
          </p>
        </div>
      </div>

      <p className={`text-[10px] font-mono mt-8 tracking-wider transition-colors duration-150 ${
        theme === 'dark' ? 'text-slate-700' : 'text-slate-400'
      }`}>
        COLLABCODE WORKSPACE &bull; SECURED REGISTRATION
      </p>
    </div>
  );
}
