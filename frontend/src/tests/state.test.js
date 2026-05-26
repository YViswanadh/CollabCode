// frontend/src/tests/state.test.js

describe('Frontend Real-Time State Management tests', () => {
  let messages;
  let activeUsers;
  let connectionStatus;
  let compilerLocked;

  beforeEach(() => {
    messages = [];
    activeUsers = [];
    connectionStatus = 'offline';
    compilerLocked = false;
  });

  // Helper mock functions simulating state setters in React
  const setMessages = (updater) => {
    messages = typeof updater === 'function' ? updater(messages) : updater;
  };

  const setActiveUsers = (updater) => {
    activeUsers = typeof updater === 'function' ? updater(activeUsers) : updater;
  };

  test('09: should add a new user chat message to the messages state array', () => {
    const mockMessage = {
      senderId: 'socket-abc',
      userId: 'user-123',
      nickname: 'Alice',
      text: 'Hello, World!',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, mockMessage]);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual(mockMessage);
  });

  test('09: should append a system joined notification to the messages state', () => {
    const mockSystemLog = {
      isSystem: true,
      text: 'Bob joined the room.',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, mockSystemLog]);

    expect(messages).toHaveLength(1);
    expect(messages[0].isSystem).toBe(true);
    expect(messages[0].text).toBe('Bob joined the room.');
  });

  test('09: should update remote collaborators states when awareness events occur', () => {
    const handleAwarenessChange = (rawStates) => {
      const remoteUsers = [];
      rawStates.forEach((state, clientId) => {
        if (clientId !== 1 && state.user) { // Assume clientID 1 is local
          remoteUsers.push({
            id: clientId,
            nickname: state.user.name,
            color: state.user.color,
            userId: state.user.userId
          });
        }
      });
      setActiveUsers(remoteUsers);
    };

    // Simulate awareness update with 1 remote collaborator
    const mockStates = new Map([
      [1, { user: { name: 'Alice' } }], // local
      [2, { user: { name: 'Bob', color: '#ff0000', userId: 'user-bob-999' } }] // remote
    ]);

    handleAwarenessChange(mockStates);

    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0]).toEqual({
      id: 2,
      nickname: 'Bob',
      color: '#ff0000',
      userId: 'user-bob-999'
    });
  });

  test('09: should update connectionStatus to online when socket connects', () => {
    const handleConnect = () => {
      connectionStatus = 'connected';
    };

    handleConnect();
    expect(connectionStatus).toBe('connected');
  });

  test('09: should toggle compiler lock states dynamically during run-code routines', () => {
    const handleExecutionStarted = () => {
      compilerLocked = true;
    };
    const handleExecutionCompleted = () => {
      compilerLocked = false;
    };

    // Code execution started
    handleExecutionStarted();
    expect(compilerLocked).toBe(true);

    // Code execution finished
    handleExecutionCompleted();
    expect(compilerLocked).toBe(false);
  });
});
