// frontend/src/tests/UserListComponent.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import UserListComponent from '../components/UserListComponent';

// Mock the useAuth hook to return a mock theme
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ theme: 'dark' })
}));

describe('UserListComponent Component tests', () => {
  test('08: should render placeholder empty text when users list is empty', () => {
    render(<UserListComponent users={[]} />);
    
    expect(screen.getByText('No other editors online')).toBeInTheDocument();
    expect(screen.getByText('Share the room ID to invite collaborators')).toBeInTheDocument();
  });

  test('08: should render list of active collaborators with nicknames and Yjs client IDs', () => {
    const mockUsers = [
      { id: 100, nickname: 'Alice', color: '#00f0ff' },
      { id: 200, nickname: 'Bob', color: '#ec4899' }
    ];

    render(<UserListComponent users={mockUsers} />);

    // Check nicknames are rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Check Yjs IDs are rendered
    expect(screen.getByText('Yjs ID: 100')).toBeInTheDocument();
    expect(screen.getByText('Yjs ID: 200')).toBeInTheDocument();

    // Check first letters are rendered as avatars
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
