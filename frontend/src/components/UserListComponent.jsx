import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Renders the list of remote collaborators currently in the room.
 * The current user's own entry is rendered directly in App.jsx with a "(You)" badge.
 */
const UserListComponent = ({ users = [] }) => {
  const { theme } = useAuth();

  if (!users || users.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 px-4 rounded-2xl border text-center space-y-2 transition-colors duration-150 ${
        theme === 'dark'
          ? 'bg-slate-950/20 border-slate-900/40 text-slate-500'
          : 'bg-slate-50 border-slate-200/60 text-slate-400'
      }`}>
        <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-xs font-mono">No other editors online</p>
        <p className="text-[10px] opacity-60 font-mono">Share the room ID to invite collaborators</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {users.map((user) => (
        <li
          key={user.id}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border hover:translate-x-0.5 transition-all duration-200 group ${
            theme === 'dark'
              ? 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800/80 text-slate-300 hover:text-slate-100'
              : 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-100/60 hover:border-slate-300 text-slate-700 hover:text-slate-900'
          }`}
        >
          {/* Avatar with user-assigned color border glow */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 border-2 transition duration-300"
            style={{
              backgroundColor: `${user.color}18`,
              borderColor: user.color || '#3b82f6',
              boxShadow: `0 0 10px ${user.color}20`,
            }}
          >
            {user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-xs font-bold truncate transition duration-150`}>
                {user.nickname || 'Anonymous Editor'}
              </p>
              {/* Animated live indicator in their color */}
              <span className="flex h-2 w-2 shrink-0 relative">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ backgroundColor: user.color || '#10b981' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: user.color || '#10b981' }}
                />
              </span>
            </div>
            <p className={`text-[9px] font-mono transition-colors duration-150 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
              Yjs ID: {user.id}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserListComponent;