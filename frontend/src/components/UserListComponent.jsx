import React from 'react';

const UserListComponent = ({ users = [] }) => {
  if (!users || users.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No other active users.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: user.color || '#3b82f6' }}
          >
            {user.nickname
              ? user.nickname.charAt(0).toUpperCase()
              : 'U'}
          </div>

          {/* Name */}
          <p className="text-sm text-gray-200 truncate">
            {user.nickname || 'Anonymous'}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default UserListComponent;