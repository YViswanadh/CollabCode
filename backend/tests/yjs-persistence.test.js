// backend/tests/yjs-persistence.test.js

const Y = require('yjs');
const Document = require('../models/DocumentModel');

// Mock DocumentModel to prevent real DB queries and simulate database storage
jest.mock('../models/DocumentModel', () => {
  const mockStore = new Map();
  return {
    findOne: jest.fn().mockImplementation(({ roomId }) => {
      return Promise.resolve(mockStore.get(roomId) || null);
    }),
    findOneAndUpdate: jest.fn().mockImplementation(({ roomId }, update, options) => {
      const existing = mockStore.get(roomId) || { roomId, yjsDocumentState: null };
      const updated = {
        ...existing,
        yjsDocumentState: update.yjsDocumentState,
        updatedAt: new Date()
      };
      mockStore.set(roomId, updated);
      return Promise.resolve(updated);
    }),
    _mockStore: mockStore
  };
});

const { getOrCreateYDoc, closeYDoc, activeYDocs } = require('../yjs-persistence-logic');

describe('Yjs Persistence & Concurrency tests', () => {
  beforeEach(() => {
    // Clear mocks and active ydocs list
    Document.findOne.mockClear();
    Document.findOneAndUpdate.mockClear();
    Document._mockStore.clear();
    activeYDocs.clear();
  });

  afterEach(async () => {
    // Ensure all timers and locks are cleaned up
    for (const roomId of activeYDocs.keys()) {
      await closeYDoc(roomId);
    }
  });

  test('02: should create a new Y.Doc when it does not exist in DB', async () => {
    const roomId = 'test-room-1';
    
    const ydoc = await getOrCreateYDoc(roomId);
    
    expect(ydoc).toBeInstanceOf(Y.Doc);
    expect(activeYDocs.has(roomId)).toBe(true);
    expect(Document.findOne).toHaveBeenCalledWith({ roomId });
  });

  test('02: should load an existing document from DB state', async () => {
    const roomId = 'test-room-2';
    
    // Seed initial document state
    const sourceDoc = new Y.Doc();
    const ytext = sourceDoc.getText('shared-code-content');
    ytext.insert(0, 'console.log("Hello DB");');
    const seedState = Y.encodeStateAsUpdate(sourceDoc);
    
    Document._mockStore.set(roomId, {
      roomId,
      yjsDocumentState: seedState,
      updatedAt: new Date()
    });

    const loadedDoc = await getOrCreateYDoc(roomId);
    
    expect(loadedDoc).toBeInstanceOf(Y.Doc);
    const loadedText = loadedDoc.getText('shared-code-content');
    expect(loadedText.toString()).toBe('console.log("Hello DB");');
  });

  test('04: should successfully merge concurrent edits and resolve conflicts', async () => {
    const roomId = 'concurrency-room';
    
    // 1. Client A and Client B getOrCreate the same document state
    const serverDoc = await getOrCreateYDoc(roomId);
    const serverText = serverDoc.getText('shared-code-content');
    
    // Initial state
    serverText.insert(0, '// Start coding');
    
    // 2. Client A makes an update locally
    const clientADoc = new Y.Doc();
    Y.applyUpdate(clientADoc, Y.encodeStateAsUpdate(serverDoc));
    const clientAText = clientADoc.getText('shared-code-content');
    clientAText.insert(15, '\nconst a = 1;');
    
    // 3. Client B makes a concurrent update locally (without Client A's edit)
    const clientBDoc = new Y.Doc();
    Y.applyUpdate(clientBDoc, Y.encodeStateAsUpdate(serverDoc));
    const clientBText = clientBDoc.getText('shared-code-content');
    clientBText.insert(15, '\nconst b = 2;');

    // 4. Apply concurrent updates to the server document
    const updateA = Y.encodeStateAsUpdate(clientADoc);
    const updateB = Y.encodeStateAsUpdate(clientBDoc);
    
    Y.applyUpdate(serverDoc, updateA);
    Y.applyUpdate(serverDoc, updateB);
    
    // 5. Ensure Yjs merges concurrent updates without losing data
    const finalText = serverText.toString();
    expect(finalText).toContain('// Start coding');
    expect(finalText).toContain('const a = 1;');
    expect(finalText).toContain('const b = 2;');
  });

  test('06: should successfully close and save the document state to DB', async () => {
    const roomId = 'save-room';
    
    const ydoc = await getOrCreateYDoc(roomId);
    const ytext = ydoc.getText('shared-code-content');
    ytext.insert(0, 'let x = 10;');

    await closeYDoc(roomId);

    // Document must be removed from active cache
    expect(activeYDocs.has(roomId)).toBe(false);
    
    // Document state must be written to MongoDB mock store
    expect(Document.findOneAndUpdate).toHaveBeenCalled();
    const savedState = Document._mockStore.get(roomId);
    expect(savedState).toBeDefined();
    
    // Load and verify saved state
    const verifyDoc = new Y.Doc();
    Y.applyUpdate(verifyDoc, savedState.yjsDocumentState);
    expect(verifyDoc.getText('shared-code-content').toString()).toBe('let x = 10;');
  });
});
