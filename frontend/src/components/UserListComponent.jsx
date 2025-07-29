
import React from 'react';
import './UserListComponent.css';



const UserListComponent = ({ users = [] }) => {
  return (
    <div className="user-list-container">
      <h4 className="user-list-header">Active Users ({users.length})</h4>
      {users.length === 0 ? (
        <p className="no-users-message">No active users yet.</p>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} style={{ color: user.color }} className="user-list-item">
              {user.nickname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserListComponent;