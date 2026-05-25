import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * Unauthenticated users are redirected to /login with the intended
 * destination saved in location.state so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading, theme } = useAuth();
  const location = useLocation();

  // While restoring session from localStorage, render high-fidelity geometric morphing spinner
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080c14] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      }`}>
        <div className="flex flex-col items-center gap-6 relative">
          {/* Premium Geometric Loading Spinner */}
          <div className="w-20 h-20 relative flex items-center justify-center">
            {/* Outer track spinning container */}
            <div className="absolute inset-0 rounded-3xl border border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-2 rounded-2xl border border-dashed border-indigo-500/20 animate-[spin_6s_linear_infinite_reverse]" />
            
            {/* Pulsing center brand badge */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 animate-pulse">
              <code className="text-white font-extrabold text-sm font-mono">&lt;&gt;</code>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className={`text-base font-bold tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Securing Connection
            </h3>
            <p className={`text-xs font-mono mt-1.5 animate-pulse ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Restoring collaborative workspace…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
